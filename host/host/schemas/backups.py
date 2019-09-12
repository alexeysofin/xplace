import marshmallow


class BackupSchema(marshmallow.Schema):
    container_name = marshmallow.fields.String(required=True, allow_none=False)
    filename = marshmallow.fields.String(required=True, allow_none=False)


class BackupRestoreSchema(marshmallow.Schema):
    container_name = marshmallow.fields.String(
        required=True, allow_none=False, load_only=True)
