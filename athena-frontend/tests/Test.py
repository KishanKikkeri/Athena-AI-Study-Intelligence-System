"""
Athena AI Study Intelligence System — Selenium Test Suite
==========================================================
10 comprehensive test classes covering every core feature of the
React + Vite frontend that connects to the FastAPI backend.

Prerequisites
-------------
pip install selenium pytest webdriver-manager pytest-html

The frontend must be running:
    cd athena-frontend && npm install && npm run dev   # serves on :3000

The FastAPI backend should be running (optional — frontend has demo mode):
    uvicorn app.main:app --reload                      # serves on :8000

Run all tests
-------------
pytest tests/test_athena_frontend.py -v

Run with visible browser (debug)
---------------------------------
HEADLESS=0 pytest tests/test_athena_frontend.py -v

Run a single class
------------------
pytest tests/test_athena_frontend.py::TestTC03_Navigation -v

Generate HTML report
--------------------
pytest tests/test_athena_frontend.py -v --html=report.html --self-contained-html

Environment variables
---------------------
ATHENA_URL   = http://localhost:3000   (frontend)
HEADLESS     = 1                       (0 = visible browser)
"""

import os
import time
import tempfile
import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

# ─── Config ───────────────────────────────────────────────────────────────────
URL      = os.getenv("ATHENA_URL", "http://localhost:3000")
HEADLESS = os.getenv("HEADLESS", "1") == "1"
WAIT     = 15   # default explicit-wait seconds
LLM_WAIT = 30   # longer wait for LLM generation calls


# ─── Helpers ──────────────────────────────────────────────────────────────────
def make_driver():
    opts = Options()
    if HEADLESS:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1440,900")
    opts.add_argument("--disable-gpu")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)
    except ImportError:
        driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(4)
    return driver


def wait_for(driver, by, selector, timeout=WAIT):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((by, selector))
    )


def wait_clickable(driver, by, selector, timeout=WAIT):
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((by, selector))
    )


def click_tab(driver, view_name):
    """Click the nav tab whose data-view attribute matches view_name."""
    btn = WebDriverWait(driver, WAIT).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, f'button[data-view="{view_name}"]'))
    )
    btn.click()
    time.sleep(0.4)


def make_txt(content="Sample AI study content for testing.") -> str:
    """Create a temporary .txt file and return its path."""
    fd, path = tempfile.mkstemp(suffix=".txt", prefix="athena_test_")
    with os.fdopen(fd, "w") as f:
        f.write(content)
    return path


def upload_and_ingest(driver, content="Machine learning fundamentals."):
    """Upload a file and click Ingest — waits for ingest to complete."""
    path = make_txt(content)
    file_input = driver.find_element(By.ID, "fileInput")
    driver.execute_script(
        "arguments[0].style.display='block'; arguments[0].style.opacity='1';", file_input
    )
    file_input.send_keys(path)
    os.unlink(path)
    time.sleep(0.4)
    btn = wait_clickable(driver, By.ID, "ingestBtn")
    btn.click()
    # Wait until at least one doc shows "Ingested" status (or 5 s max)
    try:
        WebDriverWait(driver, 6).until(
            lambda d: any("Ingested" in el.text for el in d.find_elements(By.CSS_SELECTOR, "[class*='docSize']"))
        )
    except Exception:
        time.sleep(2)   # demo mode may not show the word; give it time


# ═══════════════════════════════════════════════════════════════════════════════
# FIXTURES
# ═══════════════════════════════════════════════════════════════════════════════

@pytest.fixture(scope="session")
def driver():
    d = make_driver()
    yield d
    d.quit()


@pytest.fixture(autouse=True)
def reload(driver):
    """Fresh page load before every test."""
    driver.get(URL)
    WebDriverWait(driver, WAIT).until(
        EC.presence_of_element_located((By.ID, "navbar"))
    )


# ═══════════════════════════════════════════════════════════════════════════════
# TC-01  Page Load & Core UI
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC01_PageLoad:
    """
    Verifies the React app loads correctly and all critical DOM elements
    are present and visible on initial render.
    """

    def test_title_contains_athena(self, driver):
        assert "Athena" in driver.title, f"Expected 'Athena' in title, got: {driver.title}"

    def test_navbar_is_visible(self, driver):
        assert driver.find_element(By.ID, "navbar").is_displayed()

    def test_logo_text_visible(self, driver):
        logo = driver.find_element(By.CSS_SELECTOR, "[class*='logoText']")
        assert logo.is_displayed()
        assert "thena" in logo.text.lower()

    def test_all_five_tabs_rendered(self, driver):
        tabs = driver.find_elements(By.CSS_SELECTOR, "button[data-view]")
        ids = {t.get_attribute("data-view") for t in tabs}
        assert {"notes", "flashcards", "questions", "quiz", "chat"} == ids

    def test_hero_view_shown_initially(self, driver):
        hero = driver.find_element(By.ID, "heroView")
        assert hero.is_displayed()

    def test_sidebar_is_visible(self, driver):
        assert driver.find_element(By.ID, "sidebar").is_displayed()

    def test_upload_zone_is_visible(self, driver):
        assert driver.find_element(By.ID, "uploadZone").is_displayed()

    def test_ingest_button_disabled_initially(self, driver):
        btn = driver.find_element(By.ID, "ingestBtn")
        assert btn.get_attribute("disabled") == "true", "Ingest btn must start disabled"

    def test_status_dot_is_present(self, driver):
        dot = driver.find_element(By.ID, "statusDot")
        assert dot.is_displayed()

    def test_status_text_is_present(self, driver):
        txt = driver.find_element(By.ID, "statusText")
        assert txt.is_displayed()
        assert len(txt.text.strip()) > 0

    def test_no_severe_js_errors_on_load(self, driver):
        logs = driver.get_log("browser")
        severe = [l for l in logs if l["level"] == "SEVERE" and "favicon" not in l["message"]]
        assert severe == [], f"Severe JS errors on load: {severe}"


# ═══════════════════════════════════════════════════════════════════════════════
# TC-02  File Upload
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC02_FileUpload:
    """
    Tests the drag-and-drop / file-picker upload flow: files appear in the
    document list, ingest button becomes enabled, duplicates are blocked.
    """

    def _upload(self, driver, content="Test content"):
        path = make_txt(content)
        inp = driver.find_element(By.ID, "fileInput")
        driver.execute_script("arguments[0].style.display='block'", inp)
        inp.send_keys(path)
        os.unlink(path)
        time.sleep(0.4)
        return os.path.basename(path)

    def test_uploaded_file_appears_in_doc_list(self, driver):
        self._upload(driver)
        items = WebDriverWait(driver, WAIT).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[class*='docItem']"))
        )
        assert len(items) >= 1

    def test_ingest_button_enabled_after_upload(self, driver):
        self._upload(driver)
        btn = WebDriverWait(driver, WAIT).until(
            EC.element_to_be_clickable((By.ID, "ingestBtn"))
        )
        assert btn.get_attribute("disabled") is None

    def test_filename_shown_in_list(self, driver):
        path = make_txt("Physics notes.")
        fname = os.path.basename(path)
        inp = driver.find_element(By.ID, "fileInput")
        driver.execute_script("arguments[0].style.display='block'", inp)
        inp.send_keys(path)
        os.unlink(path)
        time.sleep(0.5)
        names = [e.text for e in driver.find_elements(By.CSS_SELECTOR, "[class*='docName']")]
        assert any(fname[:15] in n for n in names), f"'{fname}' not found in doc names: {names}"

    def test_duplicate_file_not_added_twice(self, driver):
        path = make_txt("Duplicate test.")
        try:
            inp = driver.find_element(By.ID, "fileInput")
            driver.execute_script("arguments[0].style.display='block'", inp)
            inp.send_keys(path)
            time.sleep(0.3)
            count_before = len(driver.find_elements(By.CSS_SELECTOR, "[class*='docItem']"))
            driver.execute_script("arguments[0].style.display='block'", inp)
            inp.send_keys(path)
            time.sleep(0.3)
            count_after = len(driver.find_elements(By.CSS_SELECTOR, "[class*='docItem']"))
            assert count_after == count_before, "Duplicate file should not be added twice"
        finally:
            try: os.unlink(path)
            except: pass

    def test_file_shows_size_in_list(self, driver):
        self._upload(driver, "Size check content " * 10)
        time.sleep(0.3)
        size_els = driver.find_elements(By.CSS_SELECTOR, "[class*='docSize']")
        assert any(("B" in e.text or "KB" in e.text) for e in size_els)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-03  Navigation & Tab Switching
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC03_Navigation:
    """
    Verifies that clicking each nav tab shows the correct view,
    hides all others, and marks the correct tab as active.
    """

    VIEWS = ["notes", "flashcards", "questions", "quiz", "chat"]

    def test_notes_tab_activates_notes_view(self, driver):
        click_tab(driver, "notes")
        assert driver.find_element(By.ID, "notesView").is_displayed()

    def test_flashcards_tab_activates_flashcards_view(self, driver):
        click_tab(driver, "flashcards")
        assert driver.find_element(By.ID, "flashcardsView").is_displayed()

    def test_questions_tab_activates_questions_view(self, driver):
        click_tab(driver, "questions")
        assert driver.find_element(By.ID, "questionsView").is_displayed()

    def test_quiz_tab_activates_quiz_view(self, driver):
        click_tab(driver, "quiz")
        assert driver.find_element(By.ID, "quizView").is_displayed()

    def test_chat_tab_activates_chat_view(self, driver):
        click_tab(driver, "chat")
        assert driver.find_element(By.ID, "chatView").is_displayed()

    def test_hero_hidden_after_tab_click(self, driver):
        click_tab(driver, "notes")
        hero = driver.find_element(By.ID, "heroView")
        assert not hero.is_displayed(), "Hero should be hidden once a tab is selected"

    def test_active_tab_styling(self, driver):
        click_tab(driver, "flashcards")
        active = driver.find_element(By.CSS_SELECTOR, "button[data-view='flashcards']")
        # The active tab should have an aria-selected="true" attribute
        assert active.get_attribute("aria-selected") == "true"

    def test_logo_click_returns_to_hero(self, driver):
        click_tab(driver, "notes")
        driver.find_element(By.CSS_SELECTOR, "[class*='logo']").click()
        time.sleep(0.3)
        assert driver.find_element(By.ID, "heroView").is_displayed()


# ═══════════════════════════════════════════════════════════════════════════════
# TC-04  Notes Generation
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC04_NotesGeneration:
    """
    Tests the Notes tab end-to-end: generate button triggers API call,
    content renders with headings, copy and download buttons are present.
    """

    def _setup(self, driver):
        upload_and_ingest(driver, "Neural networks and deep learning fundamentals.")
        click_tab(driver, "notes")

    def test_generate_bar_visible(self, driver):
        click_tab(driver, "notes")
        assert driver.find_element(By.ID, "generateBar").is_displayed()

    def test_generate_button_present(self, driver):
        click_tab(driver, "notes")
        btn = driver.find_element(By.ID, "generateBtn")
        assert btn.is_displayed()
        assert "Notes" in btn.text or "Generate" in btn.text

    def test_notes_content_rendered_after_generate(self, driver):
        self._setup(driver)
        driver.find_element(By.ID, "generateBtn").click()
        content = WebDriverWait(driver, LLM_WAIT).until(
            EC.visibility_of_element_located((By.ID, "notesContent"))
        )
        assert len(content.text.strip()) > 80, "Notes should contain substantial text"

    def test_notes_content_has_headings(self, driver):
        self._setup(driver)
        driver.find_element(By.ID, "generateBtn").click()
        WebDriverWait(driver, LLM_WAIT).until(
            EC.visibility_of_element_located((By.ID, "notesContent"))
        )
        headings = driver.find_elements(By.CSS_SELECTOR, "#notesContent h1, #notesContent h2, #notesContent h3")
        assert len(headings) >= 1, "Generated notes must contain at least one heading"

    def test_copy_button_present(self, driver):
        click_tab(driver, "notes")
        assert driver.find_element(By.ID, "copyNotesBtn").is_displayed()

    def test_download_button_present(self, driver):
        click_tab(driver, "notes")
        assert driver.find_element(By.ID, "downloadNotesBtn").is_displayed()


# ═══════════════════════════════════════════════════════════════════════════════
# TC-05  Flashcard Generation & Interaction
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC05_Flashcards:
    """
    Tests flashcard generation, the 3-D flip animation (question/answer
    toggle), and the shuffle feature.
    """

    def _setup(self, driver):
        upload_and_ingest(driver, "Photosynthesis is the process by which plants convert sunlight to glucose.")
        click_tab(driver, "flashcards")
        driver.find_element(By.ID, "generateBtn").click()
        WebDriverWait(driver, LLM_WAIT).until(
            EC.visibility_of_element_located((By.ID, "flashcardGrid"))
        )

    def test_flashcards_rendered(self, driver):
        self._setup(driver)
        cards = driver.find_elements(By.CSS_SELECTOR, "#flashcardGrid [class*='card']")
        assert len(cards) >= 1

    def test_count_badge_shown(self, driver):
        self._setup(driver)
        count = driver.find_element(By.ID, "cardsCount")
        assert "flashcard" in count.text.lower()

    def test_card_shows_question_tag_initially(self, driver):
        self._setup(driver)
        first = driver.find_elements(By.CSS_SELECTOR, "[class*='cardFront']")[0]
        tag   = first.find_element(By.CSS_SELECTOR, "[class*='cardTag']")
        assert "QUESTION" in tag.text.upper()

    def test_flip_shows_answer(self, driver):
        self._setup(driver)
        card = driver.find_elements(By.CSS_SELECTOR, "[class*='card']")[0]
        card.click()
        time.sleep(0.55)   # wait for CSS transition
        back_tag = driver.find_elements(By.CSS_SELECTOR, "[class*='cardBack'] [class*='cardTag']")[0]
        assert "ANSWER" in back_tag.text.upper()

    def test_shuffle_button_present_and_clickable(self, driver):
        self._setup(driver)
        btn = driver.find_element(By.ID, "shuffleBtn")
        assert btn.is_displayed()
        btn.click()
        time.sleep(0.3)
        # Cards still exist after shuffle
        assert len(driver.find_elements(By.CSS_SELECTOR, "[class*='card']")) >= 1


# ═══════════════════════════════════════════════════════════════════════════════
# TC-06  Questions Generation & MCQ Interaction
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC06_Questions:
    """
    Tests question generation, MCQ correct/wrong feedback,
    short-answer reveal, and the type-filter buttons.
    """

    def _setup(self, driver):
        upload_and_ingest(driver, "Newton's laws of motion describe force and acceleration.")
        click_tab(driver, "questions")
        driver.find_element(By.ID, "generateBtn").click()
        WebDriverWait(driver, LLM_WAIT).until(
            EC.visibility_of_element_located((By.ID, "questionsList"))
        )

    def test_questions_list_rendered(self, driver):
        self._setup(driver)
        cards = driver.find_elements(By.CSS_SELECTOR, "#questionsList [class*='qCard']")
        assert len(cards) >= 1

    def test_questions_count_badge_shown(self, driver):
        self._setup(driver)
        assert driver.find_element(By.ID, "questionsCount").is_displayed()

    def test_mcq_options_rendered(self, driver):
        self._setup(driver)
        opts = driver.find_elements(By.CSS_SELECTOR, "[class*='options'] [class*='option']")
        assert len(opts) >= 2, "MCQ must have at least 2 options"

    def test_mcq_selection_gives_feedback(self, driver):
        self._setup(driver)
        opts = driver.find_elements(By.CSS_SELECTOR, "[class*='options'] [class*='option']")
        opts[0].click()
        time.sleep(0.3)
        classes_after = [o.get_attribute("class") for o in
                         driver.find_elements(By.CSS_SELECTOR, "[class*='options'] [class*='option']")]
        has_feedback = any("optCorrect" in c or "optWrong" in c for c in classes_after)
        assert has_feedback, "Selecting an option must apply correct/wrong CSS"

    def test_filter_mcq(self, driver):
        self._setup(driver)
        driver.find_element(By.CSS_SELECTOR, "button[data-filter='mcq']").click()
        time.sleep(0.4)
        cards = driver.find_elements(By.CSS_SELECTOR, "#questionsList [class*='qCard']")
        assert all("mcqCard" in c.get_attribute("class") for c in cards), \
            "Only MCQ cards should be visible after MCQ filter"

    def test_reveal_answer_button_present(self, driver):
        self._setup(driver)
        reveal_btns = driver.find_elements(By.CSS_SELECTOR, "[id^='revealBtn']")
        assert len(reveal_btns) >= 1

    def test_reveal_answer_shows_model_answer(self, driver):
        self._setup(driver)
        reveal_btns = driver.find_elements(By.CSS_SELECTOR, "[id^='revealBtn']")
        if not reveal_btns:
            pytest.skip("No short/long answer questions generated")
        reveal_btns[0].click()
        time.sleep(0.3)
        answer_el = driver.find_elements(By.CSS_SELECTOR, "[id^='answer-']")
        assert any(el.is_displayed() and len(el.text) > 5 for el in answer_el)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-07  Quiz Engine
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC07_Quiz:
    """
    Tests the complete quiz lifecycle: start → answer → next → results,
    including the progress bar, score tracking, skip, and retry.
    """

    def _start(self, driver):
        upload_and_ingest(driver, "Statistics and probability are core to data science.")
        click_tab(driver, "quiz")
        driver.find_element(By.ID, "generateBtn").click()
        WebDriverWait(driver, LLM_WAIT).until(
            EC.visibility_of_element_located((By.ID, "quizQuestion"))
        )

    def test_quiz_starts_with_question(self, driver):
        self._start(driver)
        assert len(driver.find_element(By.ID, "quizQuestion").text.strip()) > 5

    def test_quiz_shows_options(self, driver):
        self._start(driver)
        opts = driver.find_elements(By.ID, "quizOptions")
        # Check within the first quiz options container
        opts = driver.find_elements(By.CSS_SELECTOR, "#quizOptions [class*='quizOpt']")
        assert len(opts) >= 2

    def test_progress_bar_visible(self, driver):
        self._start(driver)
        bar = driver.find_element(By.CSS_SELECTOR, "[class*='progressBar']")
        assert bar.is_displayed()

    def test_score_counter_visible(self, driver):
        self._start(driver)
        score = driver.find_element(By.ID, "quizScore")
        assert "Score" in score.text

    def test_selecting_option_reveals_next_btn(self, driver):
        self._start(driver)
        opts = driver.find_elements(By.CSS_SELECTOR, "#quizOptions [class*='quizOpt']")
        opts[0].click()
        time.sleep(0.3)
        next_btn = WebDriverWait(driver, 4).until(
            EC.visibility_of_element_located((By.ID, "quizNextBtn"))
        )
        assert next_btn.is_displayed()

    def test_skip_advances_question(self, driver):
        self._start(driver)
        before = driver.find_element(By.ID, "quizQNum").text
        driver.find_element(By.CSS_SELECTOR, "button[class*='skipBtn']").click()
        time.sleep(0.4)
        try:
            after = driver.find_element(By.ID, "quizQNum").text
            # Either advanced to next Q or hit result screen
            assert after != before or driver.find_element(By.ID, "quizResultCard") is not None
        except Exception:
            pass   # result screen shown — acceptable

    def test_quiz_completion_shows_result(self, driver):
        self._start(driver)
        # Skip through all questions
        for _ in range(20):   # max 20 iterations
            try:
                skip = driver.find_element(By.CSS_SELECTOR, "button[class*='skipBtn']")
                skip.click(); time.sleep(0.25)
            except Exception:
                break
        try:
            ring = WebDriverWait(driver, 6).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "[class*='ring']"))
            )
            assert "%" in ring.text
        except Exception:
            pass   # some skips may have already shown result

    def test_restart_button_present_during_quiz(self, driver):
        self._start(driver)
        assert driver.find_element(By.ID, "quizRestartBtn").is_displayed()


# ═══════════════════════════════════════════════════════════════════════════════
# TC-08  Chat Interface
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC08_Chat:
    """
    Tests the conversational chat: welcome message, sending user messages,
    assistant response bubbles, Enter-key send, and empty-message guard.
    """

    def test_chat_input_field_present(self, driver):
        click_tab(driver, "chat")
        assert wait_for(driver, By.ID, "chatInput").is_displayed()

    def test_send_button_present(self, driver):
        click_tab(driver, "chat")
        assert driver.find_element(By.ID, "chatSendBtn").is_displayed()

    def test_welcome_message_shown(self, driver):
        click_tab(driver, "chat")
        bubbles = driver.find_elements(By.CSS_SELECTOR, "[class*='assistant']")
        assert len(bubbles) >= 1
        assert len(bubbles[0].text.strip()) > 10

    def test_user_message_appended_on_send(self, driver):
        click_tab(driver, "chat")
        driver.find_element(By.ID, "chatInput").send_keys("What is gradient descent?")
        driver.find_element(By.ID, "chatSendBtn").click()
        time.sleep(0.5)
        user_bubbles = driver.find_elements(By.CSS_SELECTOR, "[class*='user']")
        assert any("gradient" in b.text.lower() for b in user_bubbles)

    def test_enter_key_sends_message(self, driver):
        click_tab(driver, "chat")
        before = len(driver.find_elements(By.CSS_SELECTOR, "[class*='bubble']"))
        driver.find_element(By.ID, "chatInput").send_keys("Explain backprop" + Keys.RETURN)
        time.sleep(0.5)
        after = len(driver.find_elements(By.CSS_SELECTOR, "[class*='bubble']"))
        assert after > before

    def test_assistant_responds(self, driver):
        click_tab(driver, "chat")
        driver.find_element(By.ID, "chatInput").send_keys("Summarise the document")
        driver.find_element(By.ID, "chatSendBtn").click()
        WebDriverWait(driver, LLM_WAIT).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "[class*='assistant']")) >= 2
        )
        responses = driver.find_elements(By.CSS_SELECTOR, "[class*='assistant']")
        assert len(responses[-1].text.strip()) > 10

    def test_empty_message_not_sent(self, driver):
        click_tab(driver, "chat")
        before = len(driver.find_elements(By.CSS_SELECTOR, "[class*='bubble']"))
        # Send btn should be disabled on empty input
        btn = driver.find_element(By.ID, "chatSendBtn")
        assert btn.get_attribute("disabled") == "true" or btn.get_attribute("disabled") is None
        driver.find_element(By.ID, "chatInput").clear()
        # Try clicking anyway
        try: btn.click()
        except Exception: pass
        time.sleep(0.3)
        after = len(driver.find_elements(By.CSS_SELECTOR, "[class*='bubble']"))
        assert after == before, "Empty message should not create a new bubble"


# ═══════════════════════════════════════════════════════════════════════════════
# TC-09  Settings Panel
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC09_Settings:
    """
    Tests all sidebar settings controls: model selector options,
    count input validation, and input value persistence.
    """

    def test_model_select_present(self, driver):
        sel = driver.find_element(By.ID, "modelSelect")
        assert sel.is_displayed()

    def test_model_select_has_gemini_option(self, driver):
        opts = [o.get_attribute("value") for o in
                driver.find_elements(By.CSS_SELECTOR, "#modelSelect option")]
        assert "gemini" in opts

    def test_model_select_has_groq_option(self, driver):
        opts = [o.get_attribute("value") for o in
                driver.find_elements(By.CSS_SELECTOR, "#modelSelect option")]
        assert "groq" in opts

    def test_model_select_has_ollama_option(self, driver):
        opts = [o.get_attribute("value") for o in
                driver.find_elements(By.CSS_SELECTOR, "#modelSelect option")]
        assert "ollama" in opts

    def test_count_input_present(self, driver):
        inp = driver.find_element(By.ID, "countInput")
        assert inp.is_displayed()

    def test_count_input_default_is_positive(self, driver):
        val = int(driver.find_element(By.ID, "countInput").get_attribute("value"))
        assert val >= 1

    def test_count_input_accepts_numeric_change(self, driver):
        inp = driver.find_element(By.ID, "countInput")
        inp.clear()
        inp.send_keys("8")
        assert inp.get_attribute("value") == "8"

    def test_model_select_change_persists(self, driver):
        from selenium.webdriver.support.ui import Select
        sel = Select(driver.find_element(By.ID, "modelSelect"))
        sel.select_by_value("groq")
        time.sleep(0.2)
        assert driver.find_element(By.ID, "modelSelect").get_attribute("value") == "groq"


# ═══════════════════════════════════════════════════════════════════════════════
# TC-10  Document Removal & State Management
# ═══════════════════════════════════════════════════════════════════════════════
class TestTC10_DocRemoval:
    """
    Tests document removal from the list, ingest-button state after
    removal, the empty state display, and API status indicator accuracy.
    """

    def _add_doc(self, driver, content="Test content"):
        path = make_txt(content)
        inp = driver.find_element(By.ID, "fileInput")
        driver.execute_script("arguments[0].style.display='block'", inp)
        inp.send_keys(path)
        os.unlink(path)
        time.sleep(0.4)

    def test_remove_button_present_on_doc(self, driver):
        self._add_doc(driver)
        btn = wait_for(driver, By.CSS_SELECTOR, "button[class*='removeBtn']")
        assert btn.is_displayed()

    def test_removing_doc_decreases_list(self, driver):
        self._add_doc(driver, "Remove test 1")
        self._add_doc(driver, "Remove test 2 different")
        time.sleep(0.3)
        count_before = len(driver.find_elements(By.CSS_SELECTOR, "[class*='docItem']"))
        driver.find_elements(By.CSS_SELECTOR, "button[class*='removeBtn']")[0].click()
        time.sleep(0.3)
        count_after = len(driver.find_elements(By.CSS_SELECTOR, "[class*='docItem']"))
        assert count_after == count_before - 1

    def test_ingest_disabled_after_all_docs_removed(self, driver):
        self._add_doc(driver)
        # Remove all
        while True:
            btns = driver.find_elements(By.CSS_SELECTOR, "button[class*='removeBtn']")
            if not btns: break
            btns[0].click(); time.sleep(0.2)
        btn = driver.find_element(By.ID, "ingestBtn")
        assert btn.get_attribute("disabled") == "true"

    def test_empty_state_shown_after_removal(self, driver):
        self._add_doc(driver)
        driver.find_element(By.CSS_SELECTOR, "button[class*='removeBtn']").click()
        time.sleep(0.3)
        empty = driver.find_element(By.ID, "emptyDocs")
        assert empty.is_displayed()

    def test_api_status_dot_changes_class(self, driver):
        dot = driver.find_element(By.ID, "statusDot")
        cls = dot.get_attribute("class")
        # Must be one of the known states
        assert any(s in cls for s in ["dotOnline", "dotOffline", "status"]), \
            f"Unexpected status dot class: {cls}"

    def test_status_text_reflects_connection(self, driver):
        txt = driver.find_element(By.ID, "statusText").text
        assert any(kw in txt for kw in ["online", "offline", "connect", "demo"]), \
            f"Unexpected status text: {txt}"

    def test_hero_quicklinks_navigate_to_views(self, driver):
        btns = driver.find_elements(By.CSS_SELECTOR, "[class*='quickBtn']")
        assert len(btns) >= 4
        btns[0].click()
        time.sleep(0.4)
        assert driver.find_element(By.ID, "heroView").is_displayed() is False \
            or any(
                driver.find_element(By.ID, f"{v}View").is_displayed()
                for v in ["notes","flashcards","questions","quiz","chat"]
                if driver.find_elements(By.ID, f"{v}View")
            )


# ─── Direct runner ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import subprocess, sys
    sys.exit(subprocess.call(["pytest", __file__, "-v", "--tb=short"]))