from django.conf import settings
from django.core.mail import send_mass_mail


def send_new_post_notification(post):
    author = post.author
    subscribers_qs = getattr(author, 'subscribers', None)
    if not subscribers_qs:
        return
    subscribers = subscribers_qs.all()
    emails = [u.email for u in subscribers if u.email]
    if not emails:
        return

    author_name = author.display_name or author.username
    type_label = 'рецепт' if post.post_type == 'recipe' else 'статью'
    frontend_base = getattr(settings, 'FRONTEND_BASE_URL', '').rstrip('/')
    link = f'{frontend_base}/posts/{post.id}'
    excerpt = (post.excerpt or '')[:200]
    subject = f'Новый пост: {post.title} — {author_name}'

    text_body = f'''Здравствуйте!

Пользователь {author_name} опубликовал новый {type_label}.

{post.title}
{excerpt}

Смотреть: {link}

Если вы больше не хотите получать эти письма — отпишитесь от пользователя на сайте.
'''

    messages = [
        (subject, text_body, settings.DEFAULT_FROM_EMAIL, [email])
        for email in emails
    ]
    send_mass_mail(messages, fail_silently=True)
