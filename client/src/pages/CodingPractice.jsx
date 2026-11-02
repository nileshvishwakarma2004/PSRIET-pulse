import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  codingDifficulties,
  codingLanguages,
  fetchNextQuestion,
  getCodingBadge,
  getCodingProgress,
  getDailyQuestionId,
  getNextDifficulty,
  getQuestionEditorial,
  getQuestionTopics,
  getLeaderboard,
  getStarterCode,
  saveCodingProgress,
  syncGlobalCodingLeaderboard
} from '../services/codingPractice';
import './style/CodingPractice.css';

const SESSION_MINUTES = 20;
const CONTEST_MINUTES = 30;
const ACTIVE_PROFILE_KEY = 'psriet-coding-active-profile';
const THEME_KEY = 'psriet-coding-theme';

function getSavedProfile() {
  try {
    const storedProfile = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (!storedProfile) return null;
    const profile = JSON.parse(storedProfile);
    return typeof profile?.id === 'string' && typeof profile?.name === 'string'
      ? profile
      : null;
  } catch (error) {
    console.error('Unable to load the saved coding practice profile.', error);
    return null;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function renderInlineMarkdown(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function highlightCode(code) {
  const tokenPattern = /(#[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|if|else|for|while|class|public|private|static|void|int|string|boolean|true|false|def|import|from|new|this|throw|try|catch|async|await|in|of|export|default)\b|\b\d+(?:\.\d+)?\b)/g;
  let highlighted = '';
  let lastIndex = 0;
  for (const match of code.matchAll(tokenPattern)) {
    highlighted += escapeHtml(code.slice(lastIndex, match.index));
    const token = match[0];
    const tokenClass = token.startsWith('#') || token.startsWith('//') || token.startsWith('/*')
      ? 'comment'
      : /^["'`]/.test(token)
        ? 'string'
        : /^\d/.test(token)
          ? 'number'
          : 'keyword';
    highlighted += `<span class="token-${tokenClass}">${escapeHtml(token)}</span>`;
    lastIndex = match.index + token.length;
  }
  return highlighted + escapeHtml(code.slice(lastIndex));
}

function analyzeCode(code, question) {
  const lines = code.split('\n');
  const loopCount = lines.filter((line) => /\b(for|while)\b/.test(line)).length;
  const hasNestedLoops = loopCount > 1 || /for[\s\S]{0,180}for|while[\s\S]{0,180}while/.test(code);
  const usesSetOrMap = /\b(Set|Map|set|dict|HashSet|HashMap)\b/.test(code);
  const isBinarySearch = question?.id === 'binary-search';
  const time = hasNestedLoops ? 'O(n²) suspected' : isBinarySearch ? 'O(log n) expected' : 'O(n) expected';
  const space = usesSetOrMap ? 'O(n) likely' : 'O(1) likely';
  const suggestions = [];
  if (hasNestedLoops) suggestions.push('Look for a hash-based lookup or a sliding-window approach to avoid repeated scans.');
  if (isBinarySearch && !/mid|middle/i.test(code)) suggestions.push('Keep the search range and midpoint update explicit to preserve logarithmic progress.');
  if (!usesSetOrMap && question?.id === 'duplicate-detection') suggestions.push('A set can detect previously seen values in expected constant time per item.');
  if (!suggestions.length) suggestions.push('Keep the traversal single-pass where possible and avoid storing values you do not need.');
  return { time, space, suggestions };
}

function formatSubmissionDate(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function downloadCodeSnapshot(title, language, code) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image export is not supported by this browser.');

  const lines = code.split('\n').slice(0, 40);
  const lineHeight = 22;
  canvas.width = 1080;
  canvas.height = Math.max(280, 170 + lines.length * lineHeight);
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#101c2c');
  gradient.addColorStop(1, '#1b1737');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(107, 235, 230, .35)';
  context.lineWidth = 2;
  context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  context.fillStyle = '#7ce9e3';
  context.font = '700 17px Segoe UI';
  context.fillText('PTSRIET-PULSE  /  CODE SNAPSHOT', 42, 58);
  context.fillStyle = '#f0f4ff';
  context.font = '700 25px Segoe UI';
  context.fillText(title.slice(0, 60), 42, 101);
  context.fillStyle = '#afa5ff';
  context.font = '14px Segoe UI';
  context.fillText(`${language} · local code snapshot`, 42, 128);
  context.fillStyle = '#d8e3f2';
  context.font = '15px Consolas, monospace';
  lines.forEach((line, index) => context.fillText(`${String(index + 1).padStart(2, ' ')}  ${line.slice(0, 100)}`, 42, 166 + index * lineHeight));

  const link = document.createElement('a');
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'coding'}-snapshot.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function getAssistantReply(message, question) {
  const normalizedMessage = message.toLowerCase();
  if (normalizedMessage.includes('hint') || normalizedMessage.includes('help')) {
    return question
      ? `Try this direction: ${question.hint} I can help you reason through it, but I won’t provide the answer.`
      : 'Choose a challenge first and I can offer a small conceptual nudge.';
  }
  if (normalizedMessage.includes('complex') || normalizedMessage.includes('big o') || normalizedMessage.includes('time')) {
    return 'Count how many times the main operation runs as the input grows. A single pass is often O(n); nested passes over the input are often O(n²). What part of your approach repeats?';
  }
  if (normalizedMessage.includes('approach') || normalizedMessage.includes('start') || normalizedMessage.includes('think')) {
    return question
      ? `Start by identifying the input, the result you need, and the invariant that should stay true. For this ${question.topic.toLowerCase()} challenge, ${question.hint.toLowerCase()}`
      : 'Start by writing down the input, expected output, and one small example. Then look for a pattern you can maintain as the input changes.';
  }
  return 'Let’s reason it out together: try a tiny example by hand, state what information your algorithm must remember, then check whether each step preserves that idea. Ask me for a hint or a complexity nudge if you get stuck.';
}

function AssistantDrawer({ isOpen, onClose, question }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I can give conceptual nudges, discuss complexity, and help you break a problem into steps—without giving away the solution.' }
  ]);
  const [draft, setDraft] = useState('');
  const messageListRef = useRef(null);

  useEffect(() => {
    messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { role: 'student', text },
      { role: 'assistant', text: getAssistantReply(text, question) }
    ]);
    setDraft('');
  };

  return (
    <aside className={`coding-assistant-drawer${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="coding-assistant-heading">
        <div>
          <span className="coding-assistant-eyebrow">PRACTICE COMPANION</span>
          <h2>AI Assistant</h2>
        </div>
        <button type="button" className="coding-icon-button" onClick={onClose} aria-label="Close assistant" tabIndex={isOpen ? 0 : -1}>×</button>
      </div>
      <p className="coding-assistant-context">
        {question ? `Working on: ${question.title}` : 'Your coding practice companion'}
      </p>
      <div className="coding-chat-messages" ref={messageListRef} aria-live="polite">
        {messages.map((message, index) => (
          <p className={`coding-chat-message ${message.role}`} key={`${message.role}-${index}`}>
            {message.text}
          </p>
        ))}
      </div>
      <form className="coding-chat-form" onSubmit={sendMessage}>
        <label className="coding-sr-only" htmlFor="coding-assistant-input">Message the assistant</label>
        <textarea
          id="coding-assistant-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask for a hint or approach..."
          rows="2"
          disabled={!isOpen}
          tabIndex={isOpen ? 0 : -1}
        />
        <button type="submit" disabled={!draft.trim() || !isOpen}>Send</button>
      </form>
      <p className="coding-assistant-note">Guided coaching runs locally in this practice module. It does not send your code or messages to an AI service.</p>
    </aside>
  );
}

function CodingPractice() {
  const { user } = useAuth();
  const [registeredProfile, setRegisteredProfile] = useState(getSavedProfile);
  const [profileInput, setProfileInput] = useState(() => getSavedProfile()?.name || '');
  const [profileError, setProfileError] = useState('');
  const studentId = user?.id || registeredProfile?.id || 'guest';
  const isGuest = !user && !registeredProfile;
  const profileName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || registeredProfile?.name
    || 'Guest student';
  const [progress, setProgress] = useState(null);
  const [progressError, setProgressError] = useState('');
  const [question, setQuestion] = useState(null);
  const [questionError, setQuestionError] = useState('');
  const [language, setLanguage] = useState('Python');
  const [drafts, setDrafts] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [attemptedIds, setAttemptedIds] = useState([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_MINUTES * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [workspaceTab, setWorkspaceTab] = useState('code');
  const [selectedTestCase, setSelectedTestCase] = useState('sample-0');
  const [customInput, setCustomInput] = useState('[]');
  const [verdict, setVerdict] = useState(null);
  const [submissionStats, setSubmissionStats] = useState({ submitted: 0, accepted: 0 });
  const [vote, setVote] = useState(null);
  const [votes, setVotes] = useState({ likes: 0, dislikes: 0 });
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
    } catch (error) {
      console.error('Unable to load the saved coding practice theme.', error);
      return 'dark';
    }
  });
  const [problemTab, setProblemTab] = useState('description');
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [contestMode, setContestMode] = useState(false);
  const [contestSolved, setContestSolved] = useState(0);
  const [contestResult, setContestResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardMode, setLeaderboardMode] = useState('local');
  const [leaderboardError, setLeaderboardError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [expandedSubmission, setExpandedSubmission] = useState('');
  const lineNumbersRef = useRef(null);
  const editorRef = useRef(null);
  const highlightRef = useRef(null);

  const activeDifficulty = progress?.bestDifficulty || 'Easy';
  const solvedCount = progress?.solvedIds.length || 0;
  const draftKey = question ? `${question.id}:${language}` : '';
  const codeDraft = drafts[draftKey] ?? (question ? getStarterCode(question, language) : '');
  const editorial = question ? getQuestionEditorial(question) : null;
  const analysis = question ? analyzeCode(codeDraft, question) : null;
  const earnedXp = (progress?.solvedIds.length || 0) * 100 + (progress?.streakDays || 0) * 10;
  const leaderboardEntries = leaderboard.length
    ? leaderboard
    : [{ id: studentId, name: profileName, solved: solvedCount, streakDays: progress?.streakDays || 0, xp: earnedXp, badge: getCodingBadge(earnedXp), isCurrentStudent: true }];
  const activityDates = new Set(progress?.activityDates || []);
  const heatmapDays = Array.from({ length: 84 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (83 - index));
    const key = date.toISOString().slice(0, 10);
    return { key, active: activityDates.has(key), label: date.toLocaleDateString() };
  });

  const loadQuestion = useCallback(async (difficulty, currentProgress, currentAttempts, filters = {}) => {
    setLoadingQuestion(true);
    setQuestionError('');
    setQuestion(null);
    setSelectedOption(null);
    setHintVisible(false);
    setVerdict(null);
    setWorkspaceTab('code');
    setSelectedTestCase('sample-0');
    setVote(null);
    setVotes({ likes: 0, dislikes: 0 });
    try {
      const next = await fetchNextQuestion({
        difficulty,
        solvedIds: currentProgress.solvedIds,
        attemptedIds: currentAttempts,
        ...filters
      });
      setQuestion(next);
    } catch (error) {
      console.error('Unable to fetch a coding practice question.', error);
      setQuestionError(error.message || 'Unable to load a coding challenge. Please try again.');
    } finally {
      setLoadingQuestion(false);
    }
  }, []);

  const refreshLeaderboard = useCallback(async (currentProgress) => {
    setLeaderboard(getLeaderboard(studentId));
    if (!user?.id) {
      setLeaderboardMode('local');
      setLeaderboardError('');
      return;
    }

    try {
      const entries = await syncGlobalCodingLeaderboard(user, profileName, currentProgress);
      setLeaderboard(entries);
      setLeaderboardMode('global');
      setLeaderboardError('');
    } catch (error) {
      console.error('Unable to sync the global coding leaderboard.', error);
      setLeaderboardMode('local');
      setLeaderboardError('Global rankings could not sync. Check connectivity and confirm the leaderboard migration is applied.');
    }
  }, [studentId, user, profileName]);

  useEffect(() => {
    try {
      const savedProgress = getCodingProgress(studentId);
      setProgress(savedProgress);
      setProgressError('');
      setSubmissionStats({
        submitted: savedProgress.submissions.length,
        accepted: savedProgress.submissions.filter((submission) => submission.status === 'Accepted').length
      });
      setAttemptedIds([]);
      setDrafts({});
      loadQuestion(savedProgress.bestDifficulty, savedProgress, []);
      if (studentId !== 'guest') saveCodingProgress(studentId, savedProgress, profileName);
      refreshLeaderboard(savedProgress);
    } catch (error) {
      console.error('Unable to load saved coding practice progress.', error);
      setProgressError(error.message || 'Unable to load saved progress.');
      setLoadingQuestion(false);
    }
  }, [studentId, loadQuestion, profileName, refreshLeaderboard]);

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    const name = profileInput.trim();
    if (!name) {
      setProfileError('Enter a student ID or name to save a practice profile.');
      return;
    }

    const profile = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name
    };
    try {
      saveCodingProgress(profile.id, getCodingProgress(profile.id), profile.name);
      window.localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
      setRegisteredProfile(profile);
      setLeaderboard(getLeaderboard(profile.id));
      setLeaderboardMode('local');
      setProfileError('');
    } catch (error) {
      console.error('Unable to save the coding practice profile.', error);
      setProfileError('This browser could not save your profile. Check its storage settings and try again.');
    }
  };

  useEffect(() => {
    if (!timerRunning) return undefined;
    const timerId = window.setInterval(() => {
      setSecondsRemaining((remaining) => remaining <= 1 ? 0 : remaining - 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [timerRunning]);

  useEffect(() => {
    if (timerRunning && secondsRemaining === 0) {
      setTimerRunning(false);
      setSessionComplete(true);
      if (contestMode) {
        setContestResult({ solved: contestSolved, rank: Math.max(1, 120 - contestSolved * 17) });
        setContestMode(false);
      }
    }
  }, [timerRunning, secondsRemaining, contestMode, contestSolved]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Unable to save the coding practice theme.', error);
    }
  }, [theme]);

  const completionPercent = useMemo(() => Math.min(100, Math.round((solvedCount / 9) * 100)), [solvedCount]);
  const lineCount = Math.max(14, codeDraft.split('\n').length);
  const testCases = question?.sampleTestCases || [];
  const activeSampleIndex = selectedTestCase.startsWith('sample-')
    ? Number(selectedTestCase.slice('sample-'.length))
    : -1;
  const activeSample = testCases[activeSampleIndex];

  const handleCodeChange = (event) => {
    if (!draftKey) return;
    setDrafts((current) => ({ ...current, [draftKey]: event.target.value }));
  };

  const handleEditorKeyDown = (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const updatedDraft = `${codeDraft.slice(0, start)}  ${codeDraft.slice(end)}`;
    setDrafts((current) => ({ ...current, [draftKey]: updatedDraft }));
    requestAnimationFrame(() => {
      editor.selectionStart = start + 2;
      editor.selectionEnd = start + 2;
    });
  };

  const handleEditorScroll = () => {
    if (lineNumbersRef.current && editorRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
    if (highlightRef.current && editorRef.current) {
      highlightRef.current.scrollTop = editorRef.current.scrollTop;
      highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  const handleVote = (nextVote) => {
    if (vote === nextVote) return;
    setVotes((current) => ({
      likes: current.likes + (nextVote === 'like' ? 1 : vote === 'like' ? -1 : 0),
      dislikes: current.dislikes + (nextVote === 'dislike' ? 1 : vote === 'dislike' ? -1 : 0)
    }));
    setVote(nextVote);
  };

  const handleToggleTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
      return;
    }
    if (secondsRemaining === 0) setSecondsRemaining((contestMode ? CONTEST_MINUTES : SESSION_MINUTES) * 60);
    setSessionComplete(false);
    setTimerRunning(true);
  };

  const handleJudge = (isSubmission) => {
    if (!question || sessionComplete) return;

    let result;
    if (selectedTestCase === 'custom') {
      try {
        JSON.parse(customInput);
      } catch {
        result = {
          status: 'Runtime Error',
          detail: 'The custom test input is not valid JSON. Correct it and run again.',
          runtime: '—',
          memory: '—'
        };
      }
    }
    if (!result && selectedOption === null) {
      result = {
        status: 'Wrong Answer',
        detail: 'Open Test Cases and choose the approach your solution uses before running the simulator.',
        runtime: '—',
        memory: '—'
      };
    }
    if (!result) {
      const seed = question.id.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0);
      const accepted = selectedOption === question.answer;
      const tooSlow = !accepted && /every pair|quadratic|repeatedly compare/i.test(question.options[selectedOption] || '');
      result = {
        status: accepted ? 'Accepted' : tooSlow ? 'Time Limit Exceeded' : 'Wrong Answer',
        detail: accepted
          ? 'Your selected approach matches the expected strategy for this challenge.'
          : tooSlow
            ? 'The selected approach is estimated to exceed the time budget on large inputs. Look for a more efficient strategy.'
            : 'The selected approach does not satisfy this challenge. Revisit the examples and try again.',
        runtime: `${28 + (seed % 47)} ms`,
        memory: `${14 + (seed % 13)}.0 MB`
      };
    }

    const submittedAt = new Date().toISOString();
    const submission = {
      id: `${question.id}-${Date.now()}`,
      problemId: question.id,
      problemTitle: question.title,
      status: result.status,
      submittedAt,
      language,
      code: codeDraft,
      time: result.runtime,
      isSubmission
    };
    const nextSubmissionHistory = [...(progress?.submissions || []), submission].slice(-100);
    const today = submittedAt.slice(0, 10);
    const nextProgress = {
      ...progress,
      submissions: nextSubmissionHistory,
      activityDates: progress?.activityDates || []
    };

    setSubmissionStats((current) => ({
      submitted: current.submitted + 1,
      accepted: current.accepted + (result.status === 'Accepted' ? 1 : 0)
    }));
    setVerdict(result);
    setWorkspaceTab('terminal');
    const sampleOutput = selectedTestCase.startsWith('sample-')
      ? testCases[Number(selectedTestCase.slice('sample-'.length))]?.expected
      : 'Mock output is illustrative; code is not executed.';
    setTerminalOutput([
      `> ${language} · ${isSubmission ? 'submit' : 'run'} · ${question.title}`,
      `Input: ${selectedTestCase === 'custom' ? customInput : activeSample?.input || 'No test input selected'}`,
      `Verdict: ${result.status}`,
      `Output: ${result.status === 'Accepted' ? sampleOutput || 'Strategy accepted by the local simulator.' : result.detail}`,
      `Runtime: ${result.runtime}    Memory: ${result.memory}`,
      'Note: simulated result only — submitted code was not compiled or executed.'
    ].join('\n'));

    if (result.status === 'Accepted' && isSubmission && !progress.solvedIds.includes(question.id)) {
      const solvedIds = [...progress.solvedIds, question.id];
      nextProgress.solvedIds = solvedIds;
      nextProgress.correctCount = progress.correctCount + 1;
      nextProgress.bestDifficulty = getNextDifficulty(progress.bestDifficulty);
      nextProgress.xp = solvedIds.length * 100 + (progress.streakDays || 0) * 10;
      if (contestMode) setContestSolved((count) => count + 1);
    }

    if (result.status === 'Accepted' && isSubmission && !progress.solvedIds.includes(question.id)) {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);
      nextProgress.streakDays = progress.lastSolvedDate === today
        ? progress.streakDays || 0
        : progress.lastSolvedDate === yesterdayKey
          ? (progress.streakDays || 0) + 1
          : 1;
      nextProgress.lastSolvedDate = today;
      nextProgress.activityDates = [...new Set([...(progress.activityDates || []), today])].slice(-365);
      nextProgress.xp = nextProgress.solvedIds.length * 100 + nextProgress.streakDays * 10;
    }
    try {
      saveCodingProgress(studentId, nextProgress, profileName);
      setProgress(nextProgress);
      refreshLeaderboard(nextProgress);
      if (result.status === 'Accepted' && isSubmission) {
        setAttemptedIds((current) => current.includes(question.id) ? current : [...current, question.id]);
      }
    } catch (error) {
      console.error('Unable to save coding practice progress.', error);
      setProgressError(error.message || 'The submission result was recorded, but progress could not be saved.');
    }
  };

  const loadNextQuestion = () => {
    if (progress) loadQuestion(activeDifficulty, progress, attemptedIds, { topic: topicFilter, difficultyFilter, search });
  };

  const startNewSet = () => {
    setAttemptedIds([]);
    setSessionComplete(false);
    setSecondsRemaining((contestMode ? CONTEST_MINUTES : SESSION_MINUTES) * 60);
    setTimerRunning(true);
    if (progress) loadQuestion(activeDifficulty, progress, [], { topic: topicFilter, difficultyFilter, search });
  };

  const handleResetSession = () => {
    setTimerRunning(false);
    setContestMode(false);
    setContestResult(null);
    setSessionComplete(false);
    setSecondsRemaining(SESSION_MINUTES * 60);
    setAttemptedIds([]);
    if (progress) loadQuestion(activeDifficulty, progress, []);
  };

  const handleDailyChallenge = () => {
    if (progress) loadQuestion(activeDifficulty, progress, [], { questionId: getDailyQuestionId() });
  };

  const handleFilterChange = (filters) => {
    if (progress) loadQuestion(activeDifficulty, progress, attemptedIds, {
      topic: topicFilter,
      difficultyFilter,
      search,
      ...filters
    });
  };

  const handleContestToggle = () => {
    if (contestMode) {
      setContestMode(false);
      setTimerRunning(false);
      setContestResult({ solved: contestSolved, rank: Math.max(1, 120 - contestSolved * 17) });
      setSessionComplete(true);
      return;
    }
    setContestMode(true);
    setContestSolved(0);
    setContestResult(null);
    setSecondsRemaining(CONTEST_MINUTES * 60);
    setSessionComplete(false);
    setTimerRunning(true);
    if (progress) loadQuestion(activeDifficulty, progress, attemptedIds, { topic: topicFilter, difficultyFilter, search });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeDraft);
      setCopyStatus('Copied');
      window.setTimeout(() => setCopyStatus(''), 1800);
    } catch (error) {
      console.error('Unable to copy the code from the editor.', error);
      setCopyStatus('Copy failed');
      window.setTimeout(() => setCopyStatus(''), 2200);
    }
  };

  const handleResetCode = () => {
    if (!question || !draftKey) return;
    setDrafts((current) => ({ ...current, [draftKey]: getStarterCode(question, language) }));
  };

  const handleExportCode = () => {
    try {
      downloadCodeSnapshot(question?.title || 'Coding practice', language, codeDraft);
    } catch (error) {
      console.error('Unable to export the coding snapshot.', error);
      setProgressError(error.message || 'Unable to export the code snapshot.');
    }
  };

  const questionHasBeenSolved = question && progress?.solvedIds.includes(question.id);

  return (
    <main className="coding-practice-page" data-theme={theme}>
      <aside className="coding-sidebar" aria-label="Coding test navigation">
        <Link to="/" className="coding-brand">
          <span className="coding-brand-mark" aria-hidden="true">&lt;/&gt;</span>
          <span><strong>PTSRIET-PULSE</strong><small>CODING STUDIO</small></span>
        </Link>
        <Link to="/" className="coding-sidebar-back">← <span>Student dashboard</span></Link>
        <div className="coding-sidebar-label">YOUR WORKSPACE</div>
        <nav className="coding-sidebar-nav">
          <a className="active" href="#problem"><span aria-hidden="true">⌘</span> Practice arena</a>
          <a href="#progress"><span aria-hidden="true">◷</span> Your progress</a>
        </nav>
        {!user && (
          <form className="coding-profile-form" onSubmit={handleProfileSubmit}>
            <label htmlFor="coding-profile-input">STUDENT PROFILE</label>
            <input
              id="coding-profile-input"
              value={profileInput}
              onChange={(event) => setProfileInput(event.target.value)}
              placeholder="Student ID or name"
              maxLength={50}
              autoComplete="off"
            />
            <button type="submit">{registeredProfile ? 'Switch profile' : 'Save profile'}</button>
            {profileError && <p role="alert">{profileError}</p>}
          </form>
        )}
        <div className="coding-sidebar-card">
          <span className="coding-sidebar-card-icon" aria-hidden="true">✦</span>
          <strong>Keep learning</strong>
          <p>{isGuest
            ? 'Guest mode: progress is session-bound and clears when this browser session ends.'
            : 'Your solved problems, streak, and difficulty are saved to this browser profile.'}</p>
        </div>
        <div className="coding-sidebar-profile">
          <span className="coding-profile-avatar">{profileName.trim().charAt(0).toUpperCase()}</span>
          <span><strong>{profileName}</strong><small>{isGuest ? 'Guest · session only' : 'Active practice profile'}</small></span>
        </div>
      </aside>

      <section className="coding-workspace">
        <header className="coding-topbar">
          <div className="coding-breadcrumb"><Link to="/">Dashboard</Link><span>/</span><strong>Coding Test</strong></div>
          <div className="coding-topbar-actions">
            <div className="coding-topbar-timer">
              <span aria-hidden="true">◷</span>
              <time className={secondsRemaining < 60 ? 'is-urgent' : ''}>{formatTime(secondsRemaining)}</time>
              <button type="button" onClick={handleToggleTimer} disabled={sessionComplete}>
                {timerRunning ? 'Pause' : secondsRemaining === (contestMode ? CONTEST_MINUTES : SESSION_MINUTES) * 60 ? 'Start' : 'Resume'}
              </button>
              <button type="button" className="coding-reset-button" onClick={handleResetSession} aria-label="Reset timed session">↻</button>
            </div>
            <button type="button" className="coding-daily-button" onClick={handleDailyChallenge}>Daily challenge</button>
            <button type="button" className={`coding-contest-button${contestMode ? ' active' : ''}`} onClick={handleContestToggle} disabled={!progress}>
              {contestMode ? 'End contest' : 'Start contest'}
            </button>
            <button type="button" className="coding-theme-toggle" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? '☼ Light' : '☾ Dark'}
            </button>
            <button type="button" className={`coding-assistant-toggle${assistantOpen ? ' is-active' : ''}`} onClick={() => setAssistantOpen((open) => !open)} aria-expanded={assistantOpen}>
              <span aria-hidden="true">✦</span> AI Assistant
            </button>
          </div>
        </header>

        {progressError && <p className="coding-error" role="alert">{progressError}</p>}
        {questionError && <p className="coding-error" role="alert">{questionError}</p>}

        <div className={`coding-content${assistantOpen ? ' with-assistant' : ''}`}>
          <div className="coding-split-layout">
            <section className="coding-problem-pane" id="problem" aria-labelledby="coding-problem-title">
              <form className="coding-problem-filters" onSubmit={(event) => { event.preventDefault(); handleFilterChange({ search, topic: topicFilter, difficultyFilter }); }}>
                <input aria-label="Search problems" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search challenges or tags" />
                <select aria-label="Filter by topic" value={topicFilter} onChange={(event) => { setTopicFilter(event.target.value); handleFilterChange({ topic: event.target.value }); }}>
                  <option value="">All topics</option>
                  {getQuestionTopics().map((topic) => <option value={topic} key={topic}>{topic}</option>)}
                </select>
                <select aria-label="Filter by difficulty" value={difficultyFilter} onChange={(event) => { setDifficultyFilter(event.target.value); handleFilterChange({ difficultyFilter: event.target.value }); }}>
                  <option value="">All difficulties</option>
                  {codingDifficulties.map((difficulty) => <option value={difficulty} key={difficulty}>{difficulty}</option>)}
                </select>
                <button type="submit">Find problem</button>
              </form>
              {loadingQuestion ? (
                <div className="coding-question-loading" role="status">Finding your next challenge…</div>
              ) : question ? (
                <>
                  <div className="coding-problem-meta">
                    <span className={`coding-difficulty-tag ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
                    <span className="coding-problem-number">Problem · {solvedCount + 1}</span>
                  </div>
                  <h1 id="coding-problem-title">{question.title}</h1>
                  <div className="coding-problem-stats">
                    <span className="coding-acceptance-stat">Practice acceptance <strong>{question.acceptanceRate}%</strong></span>
                    <span className="coding-stat-divider" />
                    <span>Submissions <strong>{submissionStats.submitted}</strong></span>
                    <span className="coding-stat-divider" />
                    <span>Accepted <strong>{submissionStats.accepted}</strong></span>
                    <span className="coding-vote-actions">
                      <button type="button" className={vote === 'like' ? 'is-selected' : ''} onClick={() => handleVote('like')} aria-label="Like problem">▲ <span>{votes.likes}</span></button>
                      <button type="button" className={vote === 'dislike' ? 'is-selected' : ''} onClick={() => handleVote('dislike')} aria-label="Dislike problem">▼ <span>{votes.dislikes}</span></button>
                    </span>
                  </div>

                  <div className="coding-problem-tabs" role="tablist" aria-label="Problem information">
                    <button type="button" role="tab" aria-selected={problemTab === 'description'} className={problemTab === 'description' ? 'active' : ''} onClick={() => setProblemTab('description')}>Description</button>
                    <button type="button" role="tab" aria-selected={problemTab === 'editorial'} className={problemTab === 'editorial' ? 'active' : ''} onClick={() => setProblemTab('editorial')}>Editorial / Hint</button>
                  </div>

                  {problemTab === 'description' ? (
                    <div className="coding-problem-description">
                      {question.description.split('\n').map((paragraph, index) => (
                        <p key={index}>{renderInlineMarkdown(paragraph)}</p>
                      ))}
                      <h2>Examples</h2>
                      {question.examples.map((example, index) => (
                        <article className="coding-example-card" key={`${question.id}-example-${index}`}>
                          <h3>Example {index + 1}</h3>
                          <pre><strong>Input:</strong> {example.input}</pre>
                          <pre><strong>Output:</strong> {example.output}</pre>
                          <p><strong>Explanation:</strong> {example.explanation}</p>
                        </article>
                      ))}
                      <h2>Constraints</h2>
                      <ul className="coding-constraints">
                        {question.constraints.map((constraint) => <li key={constraint}><code>{constraint}</code></li>)}
                      </ul>
                    </div>
                  ) : (
                    <div className="coding-editorial-panel">
                      <span className="coding-overline">OPTIMAL APPROACH</span>
                      <p>{editorial.approach}</p>
                      <div><span>Time complexity</span><code>{editorial.time}</code></div>
                      <div><span>Space complexity</span><code>{editorial.space}</code></div>
                      <h2>Hint</h2>
                      <p>{question.hint}</p>
                      <small>Editorial guidance is available locally and does not include executable code.</small>
                    </div>
                  )}

                  <div className="coding-topic-tags" aria-label="Problem topics">
                    {question.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>

                  {hintVisible && problemTab === 'description' && (
                    <div className="coding-hint-panel" role="status">
                      <strong>Conceptual hint</strong><p>{question.hint}</p>
                    </div>
                  )}
                  <button type="button" className="coding-hint-button" onClick={() => setHintVisible((visible) => !visible)}>
                    <span aria-hidden="true">✧</span>{hintVisible ? 'Hide hint' : 'Get a hint'}
                  </button>
                </>
              ) : (
                <div className="coding-empty-state">
                  <span aria-hidden="true">✦</span>
                  <h2>{solvedCount === 9 ? 'You’ve solved every challenge!' : 'You’ve reached the end of this question set'}</h2>
                  <p>{solvedCount === 9
                    ? 'Your solved-question history stays saved while you start a fresh test set.'
                    : 'Start a fresh set to retry unsolved questions. Questions you have already solved will stay excluded.'}</p>
                  <button type="button" onClick={startNewSet}>Start another test set</button>
                </div>
              )}
            </section>

            <section className="coding-editor-pane" aria-label="Code editor workspace">
              <div className="coding-language-tabs" role="tablist" aria-label="Programming language">
                {codingLanguages.map((item) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={language === item}
                    className={language === item ? 'active' : ''}
                    key={item}
                    onClick={() => setLanguage(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="coding-editor-toolbar">
                <div className="coding-editor-tabs" role="tablist" aria-label="Editor workspace">
                  <button type="button" role="tab" aria-selected={workspaceTab === 'code'} className={workspaceTab === 'code' ? 'active' : ''} onClick={() => setWorkspaceTab('code')}>Code</button>
                  <button type="button" role="tab" aria-selected={workspaceTab === 'tests'} className={workspaceTab === 'tests' ? 'active' : ''} onClick={() => setWorkspaceTab('tests')}>Test Cases</button>
                  <button type="button" role="tab" aria-selected={workspaceTab === 'terminal'} className={workspaceTab === 'terminal' ? 'active' : ''} onClick={() => setWorkspaceTab('terminal')}>Terminal</button>
                </div>
                <div className="coding-toolbar-actions">
                  {workspaceTab === 'code' && (
                    <>
                      <button type="button" onClick={handleCopyCode}>{copyStatus || 'Copy Code'}</button>
                      <button type="button" onClick={handleResetCode}>Reset template</button>
                      <button type="button" onClick={handleExportCode}>Export image</button>
                    </>
                  )}
                  <span className="coding-editor-language-indicator"><i /> {language}</span>
                </div>
              </div>

              {workspaceTab === 'code' ? (
                <div className="coding-editor-surface">
                  <div className="coding-line-numbers" ref={lineNumbersRef} aria-hidden="true">
                    {Array.from({ length: lineCount }, (_, index) => <span key={index}>{index + 1}</span>)}
                  </div>
                  <pre className="coding-highlighted-code" ref={highlightRef} aria-hidden="true"><code dangerouslySetInnerHTML={{ __html: highlightCode(codeDraft) }} /></pre>
                  <label className="coding-sr-only" htmlFor="coding-editor">Code solution in {language}</label>
                  <textarea
                    id="coding-editor"
                    ref={editorRef}
                    className="coding-code-editor"
                    value={codeDraft}
                    onChange={handleCodeChange}
                    onKeyDown={handleEditorKeyDown}
                    onScroll={handleEditorScroll}
                    spellCheck="false"
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    aria-label={`Code solution in ${language}`}
                    disabled={!question || sessionComplete || Boolean(questionHasBeenSolved)}
                  />
                </div>
              ) : workspaceTab === 'tests' ? (
                <div className="coding-test-panel">
                  <div className="coding-test-panel-heading">
                    <div><strong>Test cases</strong><span>Review samples or enter custom JSON input.</span></div>
                    <span className="coding-test-count">{testCases.length + 1} cases</span>
                  </div>
                  <div className="coding-test-case-list" role="tablist" aria-label="Test case selection">
                    {testCases.map((testCase, index) => (
                      <button type="button" role="tab" aria-selected={selectedTestCase === `sample-${index}`} className={selectedTestCase === `sample-${index}` ? 'active' : ''} key={`${question?.id}-test-${index}`} onClick={() => setSelectedTestCase(`sample-${index}`)}>
                        Case {index + 1}
                      </button>
                    ))}
                    <button type="button" role="tab" aria-selected={selectedTestCase === 'custom'} className={selectedTestCase === 'custom' ? 'active' : ''} onClick={() => setSelectedTestCase('custom')}>＋ Custom</button>
                  </div>
                  {selectedTestCase === 'custom' ? (
                    <label className="coding-custom-input">
                      <span>Custom input <small>Enter valid JSON</small></span>
                      <textarea value={customInput} onChange={(event) => setCustomInput(event.target.value)} rows="5" spellCheck="false" disabled={sessionComplete || !question} />
                    </label>
                  ) : activeSample ? (
                    <div className="coding-test-case-detail">
                      <div><span>Input</span><pre>{activeSample.input}</pre></div>
                      <div><span>Expected output</span><pre>{activeSample.expected}</pre></div>
                    </div>
                  ) : (
                    <p className="coding-no-tests">Sample test cases will appear when a challenge is loaded.</p>
                  )}

                  {question && (
                    <fieldset className="coding-approach-check">
                      <legend>Assessment simulator <span>Choose your solution approach</span></legend>
                      <p>The local judge checks this strategy selection. It does not compile or execute the code editor.</p>
                      {question.options.map((option, index) => (
                        <label className={selectedOption === index ? 'selected' : ''} key={`${question.id}-approach-${index}`}>
                          <input type="radio" name="solution-approach" value={index} checked={selectedOption === index} onChange={() => { setSelectedOption(index); setVerdict(null); }} disabled={sessionComplete || Boolean(questionHasBeenSolved)} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </fieldset>
                  )}
                </div>
              ) : workspaceTab === 'terminal' ? (
                <div className="coding-terminal-panel" aria-live="polite">
                  <div className="coding-terminal-heading"><span>Mock execution terminal</span><small>Local simulation · no code execution</small></div>
                  <pre>{terminalOutput || 'Choose a test case and select an approach, then run the simulator to see a mock verdict and output.'}</pre>
                </div>
              ) : null}

              <div className="coding-editor-note">
                <span aria-hidden="true">ⓘ</span> Local simulator only — code is not compiled or executed.
              </div>

              <div className="coding-action-bar">
                <div className="coding-run-actions">
                  <button type="button" className="coding-run-button" onClick={() => handleJudge(false)} disabled={!question || loadingQuestion || sessionComplete || Boolean(questionHasBeenSolved)}>
                    <span aria-hidden="true">▷</span> Run Code
                  </button>
                  <button type="button" className="coding-submit-button" onClick={() => handleJudge(true)} disabled={!question || loadingQuestion || sessionComplete || Boolean(questionHasBeenSolved)}>
                    Submit Solution
                  </button>
                </div>
                {verdict?.status === 'Accepted' && questionHasBeenSolved && (
                  <button type="button" className="coding-next-button" onClick={loadNextQuestion}>Next problem <span aria-hidden="true">→</span></button>
                )}
              </div>

              {verdict && (
                <div className={`coding-verdict-banner ${verdict.status.toLowerCase().replace(' ', '-')}`} role="status">
                  <div className="coding-verdict-icon" aria-hidden="true">{verdict.status === 'Accepted' ? '✓' : verdict.status === 'Runtime Error' ? '!' : '×'}</div>
                  <div className="coding-verdict-copy">
                    <strong>{verdict.status} <span>· SIMULATED</span></strong>
                    <p>{verdict.detail}</p>
                    <div className="coding-verdict-metrics"><span>Execution time <b>{verdict.runtime}</b></span><span>Memory <b>{verdict.memory}</b></span></div>
                    {analysis && (
                      <div className="coding-complexity-review">
                        <strong>Local code review estimate</strong>
                        <span>Time: {analysis.time} · Space: {analysis.space}</span>
                        {analysis.suggestions.map((suggestion) => <small key={suggestion}>{suggestion}</small>)}
                        <small>Heuristic estimate from editor text; it is not an AI service or compiler analysis.</small>
                      </div>
                    )}
                    {verdict.status === 'Accepted' && !questionHasBeenSolved && (
                      <small>Use <b>Submit Solution</b> to record this result and advance your difficulty.</small>
                    )}
                  </div>
                  <button type="button" onClick={() => setVerdict(null)} aria-label="Dismiss verdict">×</button>
                </div>
              )}
            </section>
          </div>

          <AssistantDrawer isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} question={question} />
        </div>

        <section className="coding-progress-card" id="progress" aria-labelledby="coding-progress-title">
          <div className="coding-progress-heading">
            <div><span className="coding-overline">YOUR MOMENTUM</span><h2 id="coding-progress-title">Progress overview</h2></div>
            <span>{solvedCount} solved</span>
          </div>
          <div className="coding-progress-track" role="progressbar" aria-label="Question bank completion" aria-valuenow={completionPercent} aria-valuemin="0" aria-valuemax="100">
            <span style={{ width: `${completionPercent}%` }} />
          </div>
          <p>{progress?.correctCount || 0} accepted submissions · {progress?.streakDays || 0} day streak · {earnedXp} XP · {getCodingBadge(earnedXp)} · Difficulty adapts automatically after each accepted submission.</p>
          <div className="coding-difficulty-steps">
            {codingDifficulties.map((level, index) => (
              <div className={`coding-difficulty-step${codingDifficulties.indexOf(activeDifficulty) >= index ? ' reached' : ''}`} key={level}>
                <span>{index + 1}</span>{level}
              </div>
            ))}
          </div>
        </section>
        <section className="coding-extended-grid" aria-label="Coding profile and contest information">
          <article className="coding-feature-card coding-heatmap-card">
            <div className="coding-feature-heading"><div><span className="coding-overline">DAILY CONSISTENCY</span><h2>Contribution heatmap</h2></div><strong>{progress?.streakDays || 0} day streak</strong></div>
            <div className="coding-heatmap" aria-label="Daily submissions over the past twelve weeks">
              {heatmapDays.map((day) => <span key={day.key} className={day.active ? 'active' : ''} title={`${day.label}${day.active ? ' · solved' : ''}`} aria-label={`${day.label}${day.active ? ' · solved a problem' : ''}`} />)}
            </div>
            <small>Each highlighted day represents an accepted solve. Activity is stored in this browser profile.</small>
          </article>
          <article className="coding-feature-card coding-leaderboard-card">
            <div className="coding-feature-heading"><div><span className="coding-overline">RANKINGS</span><h2>Leaderboard</h2></div><strong>Top 10</strong></div>
            <p className="coding-local-label">{leaderboardMode === 'global' ? 'Global leaderboard · authenticated student profiles' : 'Local leaderboard · profiles on this browser only'}</p>
            {leaderboardError && <p className="coding-leaderboard-error" role="status">{leaderboardError}</p>}
            <ol>
              {leaderboardEntries.map((entry, index) => (
                <li className={entry.isCurrentStudent ? 'current' : ''} key={entry.id}>
                  <span className="coding-rank-number">{index + 1}</span>
                  <span className="coding-rank-name">{entry.name}{entry.isCurrentStudent ? ' · You' : ''}<small>{entry.badge}</small></span>
                  <span className="coding-rank-score">{entry.solved} solved · {entry.xp} XP</span>
                </li>
              ))}
            </ol>
          </article>
          <article className="coding-feature-card coding-history-card">
            <div className="coding-feature-heading"><div><span className="coding-overline">ATTEMPT LOG</span><h2>Submission history</h2></div><strong>{progress?.submissions?.length || 0}</strong></div>
            {progress?.submissions?.length ? (
              <ol className="coding-submission-list">
                {[...progress.submissions].reverse().slice(0, 12).map((submission) => (
                  <li key={submission.id}>
                    <div><strong>{submission.problemTitle}</strong><time>{formatSubmissionDate(submission.submittedAt)}</time></div>
                    <span className={`coding-history-verdict ${submission.status.toLowerCase().replaceAll(' ', '-')}`}>{submission.status}</span>
                    <button type="button" onClick={() => setExpandedSubmission((current) => current === submission.id ? '' : submission.id)}>
                      {expandedSubmission === submission.id ? 'Hide code' : 'View code'}
                    </button>
                    {expandedSubmission === submission.id && <pre>{submission.code}</pre>}
                  </li>
                ))}
              </ol>
            ) : <p className="coding-feature-empty">Your submissions will appear here with their verdicts and code snapshots.</p>}
          </article>
          <article className="coding-feature-card coding-contest-card">
            <div className="coding-feature-heading"><div><span className="coding-overline">VIRTUAL ARENA</span><h2>Timed contest</h2></div><span className={contestMode ? 'coding-contest-live' : ''}>{contestMode ? 'LIVE' : 'READY'}</span></div>
            <p>30-minute local contest mode with adaptive problem selection and a simulated post-contest rank.</p>
            <button type="button" onClick={handleContestToggle} disabled={!progress}>{contestMode ? 'Finish contest' : 'Enter contest arena'}</button>
            {contestResult && <div className="coding-contest-result" role="status"><strong>Contest complete</strong><span>{contestResult.solved} solved · simulated rank #{contestResult.rank}</span></div>}
          </article>
        </section>
        <footer className="coding-footer"><Link to="/">← Back to student dashboard</Link><span>PTSRIET-PULSE</span></footer>
      </section>
    </main>
  );
}

export default CodingPractice;
