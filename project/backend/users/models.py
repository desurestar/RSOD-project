from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    display_name = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True)
    role = models.CharField(max_length=10, choices=[('user', 'User'), ('admin', 'admin')], default='user')

		#подписки и подписчики
    subscribers = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='subscriptions',
        blank=True
    )

    liked_posts = models.ManyToManyField(
        'blog.Post',
        related_name='liked_by',
        blank=True
    )

    def __str__(self):
        return self.username
