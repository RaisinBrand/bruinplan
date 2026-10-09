from django.urls import include, path

urlpatterns = [
    path("", include("api.urls.main")),   # main endpoints
    path("subjects/", include("api.urls.subjects")),  
    path("courses/", include("api.urls.courses")),
    path("auth/", include("api.urls.auth_routes")),
    path("course-offerings/", include("api.urls.courseOfferings")),
    path("plans/", include("api.urls.plans")),
    path("profile/", include("api.urls.users")),
    path("dars/", include("api.urls.dars")),
    path("bookmarks/", include("api.urls.bookmarks")),
    path("units/", include("api.urls.units")),
    path("course-professors/", include("api.urls.courseProfessors")),
]
