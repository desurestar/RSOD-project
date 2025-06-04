from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

def user_avatar_path(instance, filename):
    # Если пользователь еще не сохранен в БД
    if not instance.pk:
        return 'temp_avatars/' + filename
    return f'users/{instance.pk}/avatar/{filename}'

class CustomUser(AbstractUser):
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
    
    @property
    def avatar_url(self):
        if self.avatar:
            try:
                return self.avatar.url
            except ValueError:
                # Если файл не существует физически
                pass
        # Используем абсолютный URL для дефолтного аватара
        return settings.STATIC_URL + 'default-avatar.png'

    @property
    def subscribers_count(self):
        return self.subscribers.count()

    @property
    def subscriptions_count(self):
        return self.subscriptions.count()

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']