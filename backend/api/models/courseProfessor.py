from django.db import models

class CourseProfessor(models.Model):
    id = models.BigAutoField(primary_key=True)
    course_id = models.IntegerField(null=True, blank=True)
    professor_name = models.CharField(max_length=256, null=True, blank=True)
    professor_slug = models.CharField(max_length=256, null=True, blank=True)
    overall_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    easiness = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    clarity = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    workload = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    helpfulness = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    rating_count = models.IntegerField(null=True, blank=True)
    bruinwalk_url = models.TextField(null=True, blank=True)
    reviews = models.JSONField(null=True, blank=True)
    scraped_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "course_professors"
        managed = False
