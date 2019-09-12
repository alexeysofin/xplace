from django import forms
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.password_validation import validate_password
from xplace.base.utils import normalize_email

from ..models import User, UserLanguage


class SignUpForm(forms.Form):
    email = forms.EmailField(
        required=True, widget=forms.TextInput(attrs={'placeholder': 'Email'}),
    )
    language = forms.ChoiceField(
        choices=UserLanguage.CHOICES,
        widget=forms.Select(attrs={'class': 'dropdown ui selection'})
    )

    password = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'})
    )
    password_repeat = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Repeat password'})
    )

    def clean_password(self):
        password = self.cleaned_data['password']
        validate_password(password)
        return password

    def clean_email(self):
        email = normalize_email(self.cleaned_data['email'])

        try:
            u = User.objects.get(email=email)

            if not u.email_is_verified:
                raise User.DoesNotExist

        except User.DoesNotExist:
            pass
        else:
            raise forms.ValidationError(
                'User with such email is already registered.')

        return email

    def clean(self):
        cleaned_data = super().clean()

        password = cleaned_data.get('password')
        password_repeat = cleaned_data.get('password_repeat')

        if password and password != password_repeat:
            raise forms.ValidationError(
                {'password_repeat': 'Passwords do not match'})

        return cleaned_data


class SignUpConfirmForm(forms.Form):
    token = forms.CharField(required=True, widget=forms.HiddenInput())

    def clean(self):
        cleaned_data = super().clean()

        if not self.errors:
            token_obj = RegistrationToken.objects.find_token(
                cleaned_data['token'])

            if token_obj is None:
                raise forms.ValidationError('Invalid token')

            cleaned_data['token_obj'] = token_obj

        return cleaned_data


class ResetPasswordForm(forms.Form):
    email = forms.EmailField(
        required=True, widget=forms.TextInput(attrs={'placeholder': 'Email'})
    )


class ResetPasswordConfirmForm(forms.Form):
    token = forms.CharField(required=True, widget=forms.HiddenInput())

    password = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'})
    )
    password_repeat = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Repeat password'})
    )

    def clean_password(self):
        password = self.cleaned_data['password']
        validate_password(password)
        return password

    def clean(self):
        cleaned_data = super().clean()

        if not self.errors:
            password = cleaned_data['password']
            password_repeat = cleaned_data['password_repeat']

            if password != password_repeat:
                raise forms.ValidationError(
                    {'password': 'Passwords do not match'})

            token_obj = ResetPasswordToken.objects.find_token(
                cleaned_data['token'])

            if token_obj is None:
                raise forms.ValidationError('Invalid token')

            cleaned_data['token_obj'] = token_obj

        return cleaned_data


class LoginForm(AuthenticationForm):
    username = None

    email = forms.EmailField(
        required=True, widget=forms.TextInput(attrs={'placeholder': 'Email'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'})
    )

    def __init__(self, request=None, *args, **kwargs):
        """
        The 'request' parameter is set for custom auth use by subclasses.
        The form data comes in via the standard 'data' kwarg.
        """
        self.request = request
        self.user_cache = None
        super(forms.Form, self).__init__(*args, **kwargs)

    def clean(self):
        email = self.cleaned_data.get('email')
        password = self.cleaned_data.get('password')

        if email is not None and password:
            self.cleaned_data['email'] = normalize_email(email)

            self.user_cache = authenticate(
                self.request, email=email, password=password)
            if self.user_cache is None:
                raise forms.ValidationError('Invalid credentials')
            else:
                self.confirm_login_allowed(self.user_cache)

        return self.cleaned_data


class ProfileForm(forms.ModelForm):
    language = forms.ChoiceField(
        choices=UserLanguage.CHOICES,
        widget=forms.Select(attrs={'class': 'dropdown ui selection'})
    )

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'language']


class ChangePasswordForm(forms.ModelForm):
    def __init__(self, request, *args, **kwargs):
        self.request = request
        super().__init__(*args, **kwargs)

    class Meta:
        model = User
        fields = ['current_password', 'new_password', 'new_password_repeat']

    current_password = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Current password'})
    )
    new_password = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'})
    )
    new_password_repeat = forms.CharField(
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Repeat password'})
    )

    def clean_new_password(self):
        password = self.cleaned_data['new_password']
        validate_password(password)
        return password

    def clean(self):
        cleaned_data = super().clean()

        if not self.errors:

            if not self.instance.check_password(
                    cleaned_data['current_password']):
                raise forms.ValidationError({
                    'current_password': 'Invalid credentials'
                })

            new_password = cleaned_data['new_password']
            new_password_repeat = cleaned_data['new_password_repeat']

            if new_password != new_password_repeat:
                raise forms.ValidationError(
                    {'new_password': 'Passwords do not match'})

        return cleaned_data

    def save(self, commit=True):
        self.instance.set_password(self.cleaned_data['new_password'])
        self.instance.save()
        # user is logged out after password change
        login(self.request, self.instance)
        return self.instance
