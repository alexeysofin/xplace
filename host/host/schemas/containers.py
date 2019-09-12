import marshmallow.validate
import marshmallow


class ContainerSchema(marshmallow.Schema):
    state = marshmallow.fields.String(dump_only=True)
    name = marshmallow.fields.String(dump_only=True)
    config = marshmallow.fields.Dict(dump_only=True)
    info = marshmallow.fields.Dict(dump_only=True)
    username = marshmallow.fields.String(dump_only=True)


class ContainersSchema(marshmallow.Schema):
    containers = marshmallow.fields.Nested(ContainerSchema, many=True)


class ContainerCreateSchema(marshmallow.Schema):
    name = marshmallow.fields.String(
        required=True, allow_none=False, load_only=True)
    template = marshmallow.fields.String(
        required=True, allow_none=False, load_only=True)
    backend = marshmallow.fields.String(default='dir', load_only=True)
    vgname = marshmallow.fields.String(load_only=True)
    fssize = marshmallow.fields.String(load_only=True)
    fstype = marshmallow.fields.String(load_only=True)

    config = marshmallow.fields.Dict(load_only=True)
    password = marshmallow.fields.String(load_only=True)
    ssh_keys = marshmallow.fields.List(marshmallow.fields.String(load_only=True))

    template_args = marshmallow.fields.List(
        marshmallow.fields.String(required=True, allow_none=False)
    )

    @marshmallow.validates_schema
    def validate(self, data):
        return data


class ContainerUpdateSchema(marshmallow.Schema):
    config = marshmallow.fields.Dict(required=True, allow_none=False)


class ContainerStateSchema(marshmallow.Schema):
    action = marshmallow.fields.String(
        required=True, allow_none=False,
        validate=[marshmallow.validate.OneOf(StateAction.ALL)]
    )
    wait_for_ip_timeout = marshmallow.fields.Integer(
        required=False, allow_none=True
    )


class ContainerPasswordSchema(marshmallow.Schema):
    username = marshmallow.fields.String(
        required=True, allow_none=False,
    )
    password = marshmallow.fields.String(
        required=True, allow_none=False,
    )


class ContainerBackupSchema(marshmallow.Schema):
    backup_path = marshmallow.fields.String(
        required=True, allow_none=False, load_only=True
    )

