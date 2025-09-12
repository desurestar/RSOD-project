from django.http import HttpResponse
from django.utils.dateparse import parse_date
from rest_framework.views import APIView

from blog.models import Post
from reports.permissions import IsAdmin
from reports.utils_excel import build_posts_report


class PostReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = Post.objects.select_related('author').prefetch_related('tags')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_list = request.query_params.getlist('status') or request.query_params.get('status')
        post_type = request.query_params.get('post_type')
        author_id = request.query_params.get('author_id')
        tags = request.query_params.get('tags')  # csv

        if date_from:
            d = parse_date(date_from)
            if d:
                qs = qs.filter(created_at__date__gte=d)
        if date_to:
            d = parse_date(date_to)
            if d:
                qs = qs.filter(created_at__date__lte=d)
        if status_list:
            if isinstance(status_list, str):
                status_list = [status_list]
            qs = qs.filter(status__in=status_list)
        if post_type:
            qs = qs.filter(post_type=post_type)
        if author_id:
            qs = qs.filter(author_id=author_id)
        if tags:
            tag_ids = [t for t in tags.split(',') if t.isdigit()]
            for tid in tag_ids:
                qs = qs.filter(tags__id=tid)

        # OPTIONAL: annotate counts if не хранятся
        # from django.db.models import Count
        # qs = qs.annotate(likes_count=Count("likes"), ...)

        data = build_posts_report(qs, {
            'date_from': date_from or '',
            'date_to': date_to or '',
            'status': status_list or '',
            'post_type': post_type or '',
            'author_id': author_id or '',
            'tags': tags or ''
        })
        resp = HttpResponse(
            data,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        resp['Content-Disposition'] = 'attachment; filename="posts_report.xlsx"'
        return resp
