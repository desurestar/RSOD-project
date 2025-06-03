from django.db import models
from django.utils.text import slugify

# Create your models here.
class Tag(models.Model):
  name = models.CharField(max_length=100, unique=True)
  slug = models.SlugField(max_length=100, unique=True, blank=True)
  color = models.CharField(max_length=7, blank=True)
  
  def save(self, *args, **kwargs):
    if not self.slug: 
      self.slug = slugify(self.name)
    super().save(*args, **kwargs)
  
  def __str__(self):
    return self.name
  
class Ingredient(models.Model):
  name = models.CharField(max_length=255)
  quantity = models.CharField(max_length=100)
  
  def __str__(self):
    return self.name
  
class RecipeStep(models.Model):
  order = models.PositiveIntegerField()
  description = models.TextField()
  image = models.ImageField(upload_to='posts/steps/', blank=True, null=True)
  
  def __str__(self):
			return f'Step {self.order}'

class Post(models.Model):
    POST_TYPE_CHOICES = [
        ('recipe', 'Recipe'),
        ('article', 'Article'),
    ]
    post_type = models.CharField(
        max_length=10,
        choices=POST_TYPE_CHOICES,
        default='recipe'
    )
    title = models.CharField(max_length=255)
    excerpt = models.TextField()
    content = models.TextField()
    cover_image = models.ImageField(upload_to='posts/covers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    author = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='posts')
    tags = models.ManyToManyField(Tag, related_name='posts', blank=True)
    ingredients = models.ManyToManyField(Ingredient, related_name='posts', blank=True)
    recipe_steps = models.ManyToManyField(RecipeStep, related_name='posts', blank=True)

    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)

    calories = models.PositiveIntegerField(null=True, blank=True)
    cooking_time = models.PositiveIntegerField(null=True, blank=True)  

    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent_comment = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')

    def __str__(self):
        return f"Comment by {self.author.username}" 