from rest_framework import permissions

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Разрешает доступ:
    - На чтение всем аутентифицированным пользователям
    - На запись только админам (is_staff=True или role='admin')
    """
    def has_permission(self, request, view):
        # Разрешаем GET, HEAD, OPTIONS запросы
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Для остальных методов проверяем админские права
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or 
            request.user.is_superuser or
            getattr(request.user, 'role', None) == 'admin'
        )