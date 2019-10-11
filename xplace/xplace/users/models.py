import string
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db.models import Sum
from django.db import transaction
from django.db import models, IntegrityError
from django.contrib.auth.models import (
    AbstractUser, UserManager as UserManagerBase
)
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone

from xplace.base.models import BaseModel
from xplace.base.utils import generate_random_token


class UserLanguage:
    EN = 'en'
    RU = 'ru'

    CHOICES = (
        (EN, _('English')),
        (RU, _('Russian')),
    )


class UserManager(UserManagerBase):
    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        """
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(BaseModel, AbstractUser):
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    is_superuser = models.BooleanField(
        _('superuser status'),
        default=False,
        db_index=True,
        help_text=_(
            'Designates that this user has all permissions without '
            'explicitly assigning them.'
        ),
    )

    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("A user with that email already exists."),
        },
    )

    is_email_verified = models.BooleanField(default=True)

    username = models.CharField(max_length=255, blank=True)

    language = models.CharField(max_length=2, choices=UserLanguage.CHOICES)

    available_ram = models.IntegerField(default=0)
    available_disk_size = models.IntegerField(default=0)

    @property
    def used_ram(self):
        return self.containers.aggregate(Sum('ram'))['ram__sum'] or 0

    @property
    def used_disk_size(self):
        return self.containers.aggregate(
            Sum('disk_size'))['disk_size__sum'] or 0


class RegistrationTokenManager(models.Manager):
    def create(self, email, **kwargs):
        token = generate_random_token(64,
                                      string.digits + string.ascii_letters)
        expires = timezone.now() + timedelta(minutes=30)

        if 'password' in kwargs:
            kwargs['password'] = make_password(kwargs['password'])

        try:
            with transaction.atomic():
                obj = super().create(
                    token=token,
                    email=email,
                    expires=expires,
                    **kwargs
                )
        except IntegrityError:
            obj = self.get(
                email=email
            )
            obj.expires = expires
            obj.token = token
            for k, v in kwargs.items():
                setattr(obj, k, v)
            obj.save()

        return obj

    def find_token(self, token):
        try:
            obj = self.select_for_update().get(token=token)
        except self.model.DoesNotExist:
            pass
        else:
            if obj.is_active:
                return obj


class RegistrationToken(BaseModel):
    objects = RegistrationTokenManager()

    email = models.EmailField(unique=True)
    expires = models.DateTimeField()
    token = models.CharField(max_length=128, unique=True)
    language = models.CharField(max_length=2, choices=UserLanguage.CHOICES)

    @property
    def is_active(self):
        return self.expires > timezone.now()


class ResetPasswordTokenManager(models.Manager):
    def create(self, user):
        token = generate_random_token(64, string.digits + string.ascii_letters)
        expires = timezone.now() + timedelta(minutes=30)

        try:
            with transaction.atomic():
                obj = super().create(
                    token=token,
                    user=user,
                    expires=expires
                )
        except IntegrityError:
            obj = self.get(
                user=user
            )
            obj.expires = expires
            obj.token = token
            obj.save()

        return obj

    def find_token(self, token):
        try:
            obj = self.select_for_update().get(token=token)
        except self.model.DoesNotExist:
            pass
        else:
            if obj.is_active:
                return obj


class ResetPasswordToken(BaseModel):
    objects = ResetPasswordTokenManager()

    user = models.OneToOneField(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE)
    expires = models.DateTimeField()
    token = models.CharField(max_length=128, unique=True)

    @property
    def is_active(self):
        return self.expires > timezone.now()


class AuthTokenManager(models.Manager):
    def create(self, user):
        token = generate_random_token(64, string.digits + string.ascii_letters)
        expires = timezone.now() + timedelta(days=7)

        return super().create(
            token=token,
            user=user,
            expires=expires
        )

    def find_token(self, token):
        try:
            obj = self.get(token=token)
        except self.model.DoesNotExist:
            pass
        else:
            if obj.is_active:
                return obj


class AuthToken(BaseModel):
    objects = AuthTokenManager()

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    expires = models.DateTimeField()
    token = models.CharField(max_length=128, unique=True)

    user_agent = models.CharField(max_length=300, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    @property
    def is_active(self):
        return self.expires > timezone.now()


class SshKey(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='ssh_keys')
    name = models.CharField(max_length=255)
    public_key = models.TextField()
    hash_md5 = models.CharField(max_length=100)


class OrganizationQuerySet(models.QuerySet):
    def optimized(self):
        return self.select_related('owner').prefetch_related(
            'users')


class Organization(BaseModel):
    objects = OrganizationQuerySet.as_manager()

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='owned_organizations')
    name = models.CharField(max_length=255)

    users = models.ManyToManyField(
        'User', through='OrganizationUser',
        related_name='organizations')


class OrganizationUserQuerySet(models.QuerySet):
    def optimized(self):
        return self.select_related('user', 'organization')


class OrganizationUser(BaseModel):
    class Meta:
        unique_together = [
            ['user', 'organization']
        ]
    objects = OrganizationUserQuerySet.as_manager()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE,
    )


def get_resources_context(user):
    ram_used = user.used_ram
    disk_size_used = user.used_disk_size

    ram_total = user.available_ram
    disk_size_total = user.available_disk_size

    ram_percent = (ram_used / ram_total * 100) if ram_total > 0 else 0
    disk_size_percent = (disk_size_used / disk_size_total * 100) \
        if disk_size_total > 0 else 0

    return {
        'ram_total': ram_total,
        'ram_used': ram_used,
        'ram_percent': min(int(ram_percent), 100),
        'disk_size_total': disk_size_total,
        'disk_size_used': disk_size_used,
        'disk_size_percent': min(int(disk_size_percent), 100),
    }
