from django.db import migrations

GROUPS = ["admin", "manager", "staff"]

def seed_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    for name in GROUPS:
        group, created = Group.objects.get_or_create(name=name)
        print(f"{'Created' if created else 'Exists'} group: {name}")

def unseed_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    for name in GROUPS:
        Group.objects.filter(name=name).delete()

class Migration(migrations.Migration):

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
        ("users", "0010_auto_20250902_1458"),
    ]

    operations = [
        migrations.RunPython(seed_groups, reverse_code=unseed_groups),
    ]
