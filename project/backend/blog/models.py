from django.db import models
from django.utils.text import slugify
from users.models import CustomUser

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, blank=True)
    color = models.CharField(max_length=7, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug: 
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

class Ingredient(models.Model):
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class RecipeStep(models.Model):
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='steps')
    order = models.PositiveIntegerField()
    description = models.TextField()
    image = models.ImageField(upload_to='posts/steps/', blank=True, null=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ('post', 'order')
    
    def __str__(self):
        return f'Step {self.order} for {self.post.title}'

class Post(models.Model):
    POST_TYPE_CHOICES = [
        ('recipe', 'Recipe'),
        ('article', 'Article'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    post_type = models.CharField(
        max_length=10,
        choices=POST_TYPE_CHOICES,
        default='recipe'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='draft'
    )
    title = models.CharField(max_length=255)
    excerpt = models.TextField()
    content = models.TextField()
    cover_image = models.ImageField(upload_to='posts/covers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='posts')
    tags = models.ManyToManyField(Tag, related_name='posts', blank=True)
    ingredients = models.ManyToManyField(
        Ingredient, 
        through='PostIngredient',
        related_name='posts', 
        blank=True
    )
    liked_by = models.ManyToManyField(CustomUser, related_name='liked_posts', blank=True)

    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)

    calories = models.PositiveIntegerField(null=True, blank=True)
    cooking_time = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.title

class PostIngredient(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=100)

    class Meta:
        unique_together = ('post', 'ingredient', 'quantity')

    def __str__(self):
        return f"{self.ingredient.name} - {self.quantity}"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent_comment = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')

    def __str__(self):
        return f"Comment by {self.author.username}"