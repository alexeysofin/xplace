from host.exceptions import ValidationError


def validate_against_schema(schema, data):
    valid_data, errors = schema.load(data)

    if errors:
        raise ValidationError(errors=errors)

    return valid_data
