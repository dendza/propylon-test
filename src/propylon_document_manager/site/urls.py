from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from propylon_document_manager.accounts.authentication import CustomAuthToken
from propylon_document_manager.accounts.views import TokenVerifyView

# API URLS
urlpatterns = [
    path("api/", include("propylon_document_manager.site.api_router")),
    path("auth-token/", CustomAuthToken.as_view()),
    path('auth-token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

if settings.DEBUG:
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
