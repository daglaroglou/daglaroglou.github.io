import os
import json
import requests
from bs4 import BeautifulSoup

SSO_URL = "https://sso.uom.gr/login"
PORTAL_URL = "https://sis-portal.uom.gr"
SERVICE_URL = f"{PORTAL_URL}/login/cas"

username = os.getenv("USERNAME")
password = os.getenv("PASSWORD")
session_id = ""
csrf = ""
xProfile = ""
fname = ""
lname = ""
id = ""


def login():
    session = requests.Session()

    session.get(PORTAL_URL, allow_redirects=True)

    login_page = session.get(
        SSO_URL,
        params={"service": SERVICE_URL}
    )
    soup = BeautifulSoup(login_page.text, "html.parser")

    execution = soup.find("input", {"name": "execution"})
    if not execution:
        raise Exception("CAS execution token not found")

    execution = execution["value"]

    lt_input = soup.find("input", {"name": "lt"})
    lt = lt_input["value"] if lt_input else None

    payload = {
        "username": username,
        "password": password,
        "execution": execution,
        "_eventId": "submit"
    }

    if lt:
        payload["lt"] = lt

    resp = session.post(
        SSO_URL,
        params={"service": SERVICE_URL},
        data=payload,
        headers={"Referer": login_page.url},
        allow_redirects=True
    )

    if "login" in resp.url.lower():
        raise Exception("Login failed. Check credentials.")

    print("[1/4] Logged in successfully")
    return session


def get_csrf(session):
    resp = session.get(PORTAL_URL)
    soup = BeautifulSoup(resp.text, "html.parser")

    meta = soup.find("meta", {"name": "_csrf"})
    if not meta:
        raise Exception("CSRF token not found")

    return meta["content"]


def get_session_cookie(session):
    return session.cookies.get("JSESSIONID")


session = login()
csrf = get_csrf(session)
print("[2/4] CSRF token fetched")

session_id = get_session_cookie(session)
if session_id:
    print("[3/4] JSESSIONID fetched")
else:
    print("[-] JSESSIONID cookie not found!")

headers = {
    "Cookie": f"JSESSIONID={session_id}",
    "X-CSRF-TOKEN": csrf,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
}

r = session.get(f"{PORTAL_URL}/api/person/profiles", headers=headers).json()
for student_profile in r["studentProfiles"]:
    if student_profile["studentStatusTitle"] == "Ενεργός":
        fname = student_profile["firstname"]
        lname = student_profile["lastname"]
        id = student_profile["studentNo"]
        department = student_profile["departmentTitle"]
        xProfile = student_profile["id"]

print("[4/4] Student profile fetched")

headers["X-Profile"] = str(xProfile)

r2 = session.get(f"{PORTAL_URL}/feign/student/grades/all", headers=headers).json()
if isinstance(r2, list):
    seen_courses = {}
    for course in r2:
        course_name = course.get("title", "N/A")
        course_code = course.get("courseCode", "N/A")
        grade = course.get("grade", "N/A")
        date_added = course.get("dateAdded", 0)
        student_semester = course.get("studentSemester", "N/A")
        semester_id = course.get("semesterId", {})
        semester_title = semester_id.get("title", "N/A") if isinstance(semester_id, dict) else "N/A"
        ects = course.get("units") if isinstance(course.get("units"), (int, float)) else course.get("gradeWeight", 0)
        try:
            ects = int(ects) if ects is not None else 0.0
        except Exception:
            ects = 0.0

        course_key = f"{course_code}:{course_name}"

        if course_key not in seen_courses:
            seen_courses[course_key] = {
                "grade": grade,
                "dateAdded": date_added,
                "studentSemester": student_semester,
                "semesterTitle": semester_title,
                "ects": ects
            }
        else:
            if date_added > seen_courses[course_key]["dateAdded"]:
                seen_courses[course_key] = {
                    "grade": grade,
                    "dateAdded": date_added,
                    "studentSemester": student_semester,
                    "semesterTitle": semester_title,
                    "ects": ects
                }

    semester_order_map = {
        "Α εξάμηνο": 1,
        "Β εξάμηνο": 2,
        "Γ εξάμηνο": 3,
        "Δ εξάμηνο": 4,
        "Ε εξάμηνο": 5,
        "Ζ εξάμηνο": 6,
        "Η εξάμηνο": 7,
        "Θ εξάμηνο": 8
    }

    organized_courses = {}
    total_points = 0
    total_ects = 0
    for course_key, data in seen_courses.items():
        course_code, course_name = course_key.split(":", 1)
        grade = data["grade"]
        ects = data.get("ects", 0) or 0

        if isinstance(grade, (int, float)) and grade != "N/A":
            converted_grade = grade * 10
        else:
            converted_grade = grade

        if isinstance(converted_grade, float) and converted_grade == int(converted_grade):
            converted_grade = int(converted_grade)

        if isinstance(converted_grade, (int, float)):
            try:
                g = float(converted_grade)
                total_points += g * int(ects)
                total_ects += int(ects)
            except Exception:
                pass

        semester_display = data["semesterTitle"]
        semester_number = semester_order_map.get(semester_display, 1)
        year = (semester_number - 1) // 2 + 1

        if year not in organized_courses:
            organized_courses[year] = {}
        if semester_display not in organized_courses[year]:
            organized_courses[year][semester_display] = []

        organized_courses[year][semester_display].append({
            "courseCode": course_code,
            "courseName": course_name,
            "grade": converted_grade,
            "ects": ects,
            "passed": converted_grade >= 5.0 if isinstance(converted_grade, (int, float)) else False
        })

    final_results = []
    for year in sorted(organized_courses.keys()):
        year_data = {
            "year": f"Year {year}",
            "semesters": []
        }

        semester_list = list(organized_courses[year].keys())
        semester_list.sort(key=lambda s: semester_order_map.get(s, 1))

        for semester in semester_list:
            semester_data = {
                "semester": semester,
                "courses": organized_courses[year][semester]
            }
            year_data["semesters"].append(semester_data)
        final_results.append(year_data)

    overall_average = float(
        session.get(
            f"{PORTAL_URL}/feign/student/grades/average_student_course_grades",
            headers=headers
        ).text
    )
    if isinstance(overall_average, float) and overall_average == int(overall_average):
        overall_average = int(overall_average)

    output_obj = {
        "student": {
            "firstName": fname,
            "lastName": lname,
            "studentNo": id,
        },
        "overallAverage": overall_average,
        "overallECTS": total_ects,
        "years": final_results
    }

    output_path = os.path.join("..", "..", "src", "data", "grades.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_obj, f, ensure_ascii=False, indent=2)
    print(f"[+] Results saved to {output_path}")
else:
    print("[-] Unexpected response format")
