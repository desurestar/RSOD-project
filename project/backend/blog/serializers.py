from rest_framework import serializers
from .models import Tag, Ingredient, RecipeStep, Post, Comment, PostIngredient

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
        read_only_fields = ('post',)
        
class PostIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    
    class Meta:
        model = PostIngredient
        fields = ['ingredient', 'quantity']

class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    tags = TagSerializer(many=True, read_only=True)
    ingredients = PostIngredientSerializer(
        source='postingredient_set', 
        many=True, 
        read_only=True
    )
    steps = RecipeStepSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), 
        source='tags', 
        many=True, 
        write_only=True,
        required=False
    )
    ingredient_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="Format: [{'ingredient': id, 'quantity': 'text'}, ...]"
    )
    step_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="Format: [{'order': 1, 'description': 'text', 'image': file}, ...]"
    )

    class Meta:
        model = Post
        fields = [
            'id', 'post_type', 'status', 'title', 'excerpt', 'content', 'cover_image',
            'created_at', 'updated_at', 'author', 'tags', 'ingredients', 
            'steps', 'likes_count', 'comments_count', 'views_count',
            'calories', 'cooking_time', 'is_liked',
            'tag_ids', 'ingredient_data', 'step_data'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'author', 
                          'likes_count', 'comments_count', 'views_count', 'is_liked']

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.liked_by.filter(id=user.id).exists()
        return False

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredient_data', [])
        steps_data = validated_data.pop('step_data', [])
        post = super().create(validated_data)
        
        for item in ingredients_data:
            PostIngredient.objects.create(
                post=post,
                ingredient_id=item['ingredient'],
                quantity=item['quantity']
            )
            
        for step in steps_data:
            RecipeStep.objects.create(post=post, **step)
            
        return post

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredient_data', None)
        steps_data = validated_data.pop('step_data', None)
        instance = super().update(instance, validated_data)
        
        if ingredients_data is not None:
            instance.ingredients.clear()
            for item in ingredients_data:
                PostIngredient.objects.create(
                    post=instance,
                    ingredient_id=item['ingredient'],
                    quantity=item['quantity']
                )
                
        if steps_data is not None:
            instance.steps.all().delete()
            for step in steps_data:
                RecipeStep.objects.create(post=instance, **step)
                
        return instance

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'parent_comment']
        read_only_fields = ['id', 'created_at', 'author', 'post']