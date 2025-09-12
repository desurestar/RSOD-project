from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from reports.views import PostReportView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/reports/posts/', PostReportView.as_view(), name='post-report'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
