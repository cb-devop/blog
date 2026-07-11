from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Post, Page, Category, Tag, SEOMetadata, Subscriber
from .serializers import (
    PostSerializer, PageSerializer, CategorySerializer, 
    TagSerializer, SEOMetadataSerializer, SubscriberSerializer
)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Post.objects.all()
        status_filter = self.request.query_params.get('status', None)
        category = self.request.query_params.get('category', None)
        tag = self.request.query_params.get('tag', None)
        
        if self.action == 'list' and not self.request.user.is_authenticated:
            queryset = queryset.filter(status='published')
        
        if status_filter and self.request.user.is_authenticated:
            queryset = queryset.filter(status=status_filter)
        if category:
            queryset = queryset.filter(category__slug=category)
        if tag:
            queryset = queryset.filter(tags__slug=tag)
        
        return queryset.select_related('author', 'category', 'seo').prefetch_related('tags')

class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.filter(is_active=True)
    serializer_class = PageSerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'

class SubscriberViewSet(viewsets.ModelViewSet):
    queryset = Subscriber.objects.filter(is_active=True)
    serializer_class = SubscriberSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def subscribe(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        subscriber, created = Subscriber.objects.get_or_create(email=email)
        if not created and not subscriber.is_active:
            subscriber.is_active = True
            subscriber.save()
        
        return Response({'message': 'Subscribed successfully'}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)