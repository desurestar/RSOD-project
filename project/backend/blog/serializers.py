from rest_framework import serializers
from .models import Tag, Ingredient, RecipeStep, Post, Comment

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'

class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    tags = TagSerializer(many=True, read_only=True)
    ingredients = IngredientSerializer(many=True, read_only=True)
    recipe_steps = RecipeStepSerializer(many=True, read_only=True)
    
    # Для записи через PrimaryKeyRelatedField
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), 
        source='tags', 
        many=True, 
        write_only=True,
        required=False
    )
    ingredient_ids = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(),
        source='ingredients',
        many=True,
        write_only=True,
        required=False
    )
    recipe_step_ids = serializers.PrimaryKeyRelatedField(
        queryset=RecipeStep.objects.all(),
        source='recipe_steps',
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = Post
        fields = [
            'id', 'post_type', 'title', 'excerpt', 'content', 'cover_image',
            'created_at', 'updated_at', 'author', 'tags', 'ingredients', 
            'recipe_steps', 'likes_count', 'comments_count', 'views_count',
            'calories', 'cooking_time', 'tag_ids', 'ingredient_ids', 'recipe_step_ids'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'author', 
                            'likes_count', 'comments_count', 'views_count']

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'parent_comment']
        read_only_fields = ['id', 'created_at', 'author', 'post']