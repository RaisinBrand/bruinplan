from django.urls import path
from api.views.auth_views import createUser, loginUser, googleLogin, createProfile

urlpatterns = [
    path("sign-up/", createUser),
    path("login/", loginUser),
    path("google-login/", googleLogin),
    path("complete-profile/", createProfile),
]
