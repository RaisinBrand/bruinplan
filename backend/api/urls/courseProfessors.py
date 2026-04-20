from django.urls import path
from api.views.courseProfessors import course_professors_list

urlpatterns = [
    path("", course_professors_list, name="course_professors_list"),
]
