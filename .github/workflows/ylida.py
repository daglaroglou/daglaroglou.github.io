import os
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import chromedriver_autoinstaller

chromedriver_autoinstaller.install(path="")

username = os.getenv("USERNAME")
password = os.getenv("PASSWORD")
url = "https://sis-portal.uom.gr/"
session_id = ""
csrf = ""
xProfile = ""

def setup_driver():
    """Setup and return a Chrome WebDriver instance"""
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-software-rasterizer')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--disable-features=IsolateOrigins,site-per-process')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging', 'enable-automation'])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

driver = setup_driver()
driver.get(url)

try:
    wait = WebDriverWait(driver, 5)
    
    wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
    print("[1/12] Page DOM loaded completely")
    
    username_input = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input.mdc-text-field__input.inputArrangeUsername#username"))
    )
    print("[2/12] Username field is now available and interactive")
    
    wait.until(lambda driver: driver.execute_script(
        "return typeof jQuery !== 'undefined' ? jQuery.active == 0 : true"
    ))
    print("[3/12] JavaScript initialization complete")
    
    username_input.clear()
    username_input.send_keys(username)

    print("[4/12] Entered username field")

    password_input = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input.mdc-text-field__input.pwd.inputArrangePassword#password"))
    )
    print("[5/12] Password field is now available and interactive")
    
    password_input.clear()
    password_input.send_keys(password)

    print("[6/12] Password entered")
    
    login_button = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button#loginButton.mdc-button.mdc-button--raised"))
    )
    print("[7/12] Login button is now available and clickable")
    
    login_button.click()
    
    print("[8/12] Successfully clicked the Login button!")
    
    wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
    
    wait.until(lambda driver: driver.current_url != url)
    print("[9/12] Page loaded after login.")
    
    csrf_meta = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "meta[name='_csrf']"))
    )
    
    csrf = csrf_meta.get_attribute("content")
    print("[10/12] Successfully fetched CSRF token")
    
    ses_id = driver.get_cookie("JSESSIONID")
    session_id = ses_id['value'] if ses_id else None

    if session_id:
        print("[11/12] Successfully fetched JSESSIONID")
    else:
        print("[-] JSESSIONID cookie not found!")

    driver.quit()

except Exception as e:
    print(f"[-] Error finding or filling username field: {e}")
    driver.quit()

headers = {
    "Cookie": f"JSESSIONID={session_id}",
    "X-CSRF-TOKEN": csrf,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
}

r = requests.get(url+'api/person/profiles', headers=headers).json()
for student_profile in r['studentProfiles']:
    if student_profile['studentStatusTitle'] == 'Ενεργός':
        fname = student_profile['firstname']
        lname = student_profile['lastname']
        id = student_profile['studentNo']
        department = student_profile['departmentTitle']
        xProfile = student_profile['id']

print("[12/12] Student profile fetched")

r2 = requests.get(url+"/feign/student/grades/all", headers=headers).json()
if isinstance(r2, list):
    seen_courses = {}
    for course in r2:
        course_name = course.get('title', 'N/A')
        course_code = course.get('courseCode', 'N/A')
        grade = course.get('grade', 'N/A')
        date_added = course.get('dateAdded', 0)
        student_semester = course.get('studentSemester', 'N/A')
        semester_id = course.get('semesterId', {})
        semester_title = semester_id.get('title', 'N/A') if isinstance(semester_id, dict) else 'N/A'
        ects = course.get('units') if isinstance(course.get('units'), (int, float)) else course.get('gradeWeight', 0)
        try:
            ects = int(ects) if ects is not None else 0.0
        except Exception:
            ects = 0.0

        course_key = f"{course_code}:{course_name}"
         
        if course_key not in seen_courses:
            seen_courses[course_key] = {
                'grade': grade,
                'dateAdded': date_added,
                'studentSemester': student_semester,
                'semesterTitle': semester_title,
                'ects': ects
            }
        else:
            
            if date_added > seen_courses[course_key]['dateAdded']:
                seen_courses[course_key] = {
                    'grade': grade,
                    'dateAdded': date_added,
                    'studentSemester': student_semester,
                    'semesterTitle': semester_title,
                    'ects': ects
                }
    
    semester_order_map = {
        'Α εξάμηνο': 1,
        'Β εξάμηνο': 2,
        'Γ εξάμηνο': 3,
        'Δ εξάμηνο': 4,
        'Ε εξάμηνο': 5,
        'Ζ εξάμηνο': 6,
        'Η εξάμηνο': 7,
        'Θ εξάμηνο': 8
    }
    
    organized_courses = {}
    total_points = 0
    total_ects = 0
    for course_key, data in seen_courses.items():
        course_code, course_name = course_key.split(':', 1)
        grade = data['grade']
        ects = data.get('ects', 0) or 0
        
        if isinstance(grade, (int, float)) and grade != 'N/A':
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

        semester_display = data['semesterTitle']
        semester_number = semester_order_map.get(semester_display, 1)
        year = (semester_number - 1) // 2 + 1
        
        
        if year not in organized_courses:
            organized_courses[year] = {}
        if semester_display not in organized_courses[year]:
            organized_courses[year][semester_display] = []
        
        organized_courses[year][semester_display].append({
            'courseCode': course_code,
            'courseName': course_name,
            'grade': converted_grade,
            'ects': ects,
            'passed': converted_grade >= 5.0 if isinstance(converted_grade, (int, float)) else False
        })
    
    
    final_results = []
    for year in sorted(organized_courses.keys()):
        year_data = {
            'year': f'Year {year}',
            'semesters': []
        }
        
        semester_list = list(organized_courses[year].keys())
        semester_list.sort(key=lambda s: semester_order_map.get(s, 1))
        
        for semester in semester_list:
            semester_data = {
                'semester': semester,
                'courses': organized_courses[year][semester]
            }
            year_data['semesters'].append(semester_data)
        final_results.append(year_data)
    
    overall_average = float(requests.get(url+"/feign/student/grades/average_student_course_grades", headers=headers).text)
    if isinstance(overall_average, float) and overall_average == int(overall_average):
        overall_average = int(overall_average)

    output_obj = {
        'student': {
            'firstName': fname,
            'lastName': lname,
            'studentNo': id,
        },
        'overallAverage': overall_average,
        'overallECTS': total_ects,
        'years': final_results
    }

    output_path = os.path.join('..', '..', 'src', 'data', 'grades.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_obj, f, ensure_ascii=False, indent=2)
    print(f"[+] Results saved to {output_path}")
else:
    print("[-] Unexpected response format")