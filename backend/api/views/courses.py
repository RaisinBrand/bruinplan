import re
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models.course import Course
from api.models.subject import Subject
from api.models.gradeDistribution import GradeDistribution

@api_view(["GET"])
def list_courses(request, subject_area_id = None):
    if request.method == "GET":
        if not subject_area_id:
            courses = Course.objects.all().order_by("id")
        else:
            courses = Course.objects.filter(subject_area_id=subject_area_id).order_by("id")
        data = []
        for course in courses:
            data.append({
                "id": course.id,
                "subject_area_id": course.subject_area_id,
                "number": course.number,
                "title": course.title,
                "description": course.description,
                "units": course.units,
                "requisites_text": course.requisites_text,
                "created_at": course.created_at,
                "updated_at": course.updated_at,
                "requisites_parsed": course.requisites_parsed,})
        return Response({"courses": data})
    
@api_view(["GET"])
def courses_by_ids(request):
    ids_param = request.query_params.get("ids", "")
    try:
        ids = [int(x) for x in ids_param.split(",") if x.strip()]
    except ValueError:
        return Response({"error": "ids must be comma-separated integers"}, status=400)
    if not ids:
        return Response({"courses": []})

    courses = Course.objects.filter(id__in=ids).order_by("id")
    # Build subject code lookup
    subject_ids = set(c.subject_area_id for c in courses)
    subjects = {s.id: s.code for s in Subject.objects.filter(id__in=subject_ids)}

    data = []
    for c in courses:
        data.append({
            "id": c.id,
            "subject_area_id": c.subject_area_id,
            "subject_code": subjects.get(c.subject_area_id, ""),
            "number": c.number,
            "title": c.title,
            "description": c.description,
            "units": c.units,
            "requisites_text": c.requisites_text,
            "requisites_parsed": c.requisites_parsed,
        })
    return Response({"courses": data})


@api_view(["GET"])
def course_prereqs(request, course_id = None):
    if request.method == "GET":
        if not course_id:
            #error
            pass
        try:
            reqs = Course.objects.values_list("requisites_parsed", flat=True).get(id=course_id)
        except Course.DoesNotExist:
            reqs = None
        
        if reqs is None:
            reqs = {}

        return Response({
            "course_id": course_id,
            "requisites": reqs
        })

def _norm_label(s):
    return re.sub(r"\s+", " ", str(s).strip().upper())


def _serialize_course_row(c, subject_code):
    return {
        "id": c.id,
        "subject_area_id": c.subject_area_id,
        "subject_code": subject_code,
        "number": c.number,
        "title": c.title,
        "description": c.description,
        "units": c.units,
        "requisites_text": c.requisites_text,
        "requisites_parsed": c.requisites_parsed,
    }


@api_view(["POST"])
def courses_by_labels(request):
    """
    Resolve course labels like "COM SCI 32" to Course rows.
    Uses targeted DB queries instead of loading every course into memory.
    """
    labels = request.data.get("labels", [])
    if not labels:
        return Response({"courses": []})

    # Unique (subject code fragment, course number) pairs from labels
    code_parts = set()
    pairs = []
    seen_pair = set()
    for raw in labels:
        if not raw:
            continue
        l_norm = _norm_label(raw)
        parts = l_norm.rsplit(" ", 1)
        if len(parts) != 2:
            continue
        code_part, num_part = parts[0].strip(), parts[1].strip()
        if not code_part or not num_part:
            continue
        key = (code_part, num_part.upper())
        if key in seen_pair:
            continue
        seen_pair.add(key)
        code_parts.add(code_part)
        pairs.append((code_part, num_part))

    if not pairs:
        return Response({"courses": []})

    subj_q = Q()
    for c in code_parts:
        subj_q |= Q(code__iexact=c)
    subject_rows = Subject.objects.filter(subj_q)
    # Map normalized subject.code -> id (labels use the same spacing/casing as catalog codes)
    code_to_id = {}
    for s in subject_rows:
        key = _norm_label(s.code)
        code_to_id[key] = s.id

    q = None
    for code_part, num_part in pairs:
        sid = code_to_id.get(code_part)
        if sid is None:
            continue
        clause = Q(subject_area_id=sid, number__iexact=num_part)
        q = clause if q is None else (q | clause)

    if q is None:
        return Response({"courses": []})

    courses = list(Course.objects.filter(q))
    subject_ids = {c.subject_area_id for c in courses}
    subjects = {s.id: s.code for s in Subject.objects.filter(id__in=subject_ids)}

    matched = []
    for c in courses:
        code = subjects.get(c.subject_area_id, "")
        matched.append(_serialize_course_row(c, code))

    return Response({"courses": matched})

@api_view(["GET"])
def course_grades(request, course_id=None):
    if not course_id:
        return Response({"error": "course_id is required"}, status=400)
    
    distributions = GradeDistribution.objects.filter(course_id=course_id)
    
    data = []
    for d in distributions:
        data.append({
            "term": d.term,
            "instructor": d.instructor,
            "grades_json": d.grades_json,
            "total_enrolled": d.total_enrolled
        })

    return Response({"grades": data})