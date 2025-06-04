from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.db.models import Count

from backend import settings

def user_avatar_path(instance, filename):
    if not instance.pk:
        return 'temp_avatars/' + filename
    return f'users/{instance.pk}/avatar/{filename}'

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        USER = 'user', _('User')
        ADMIN = 'admin', _('Admin')
        
    display_name = models.CharField(
        _('display name'),
        max_length=150,
        blank=True,
        help_text=_('Will be shown instead of username')
    )
    avatar = models.ImageField(
        _('avatar'),
        upload_to=user_avatar_path,
        blank=True,
        null=True,
        help_text=_('User profile image')
    )
    subscribers = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='subscriptions',
        blank=True
    )
    
    role = models.CharField(
        _('role'),
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
        help_text=_('User role')
    )
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser
    
    @property
    def avatar_url(self):
        if self.avatar:
            try:
                return self.avatar.url
            except ValueError:
                pass
        return settings.STATIC_URL + 'default-avatar.png'

    def get_subscribers_count(self):
        return self.subscribers.count()

    def get_subscriptions_count(self):
        return self.subscriptions.count()

    def get_posts_count(self):
        return self.posts.count()

    def get_liked_posts_count(self):
        return self.liked_posts.count()

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']