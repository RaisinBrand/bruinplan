from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models.courseProfessor import CourseProfessor

@api_view(["GET"])
def course_professors_list(request):
    """
    Get a list of professor ratings and reviews for a specific course.
    """
    course_id = request.query_params.get("course_id")
    if not course_id:
        return Response({"error": "course_id is required"}, status=400)
    
    professors = CourseProfessor.objects.filter(course_id=course_id)
    
    data = []
    for p in professors:
        data.append({
            "id": p.id,
            "course_id": p.course_id,
            "professor_name": p.professor_name,
            "professor_slug": p.professor_slug,
            "overall_rating": p.overall_rating,
            "easiness": p.easiness,
            "clarity": p.clarity,
            "workload": p.workload,
            "helpfulness": p.helpfulness,
            "rating_count": p.rating_count,
            "bruinwalk_url": p.bruinwalk_url,
            "reviews": p.reviews,
        })
    
    return Response({"professors": data})
