# Generated by Django 3.0.3 on 2021-07-21 21:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0112_creditagreement_optional_agreement_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='credittransactiontype',
            name='transaction_type',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]