import { supabase } from '../supabaseClient';

const questionBank = [
  {
    id: 'array-sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    title: 'Summing an array',
    prompt: 'Given an array of integers, which approach returns the sum of every element?',
    description: 'Given an integer array `values`, return the sum of all its elements. The input may contain positive numbers, negative numbers, or zero.',
    examples: [
      { input: 'values = [1, 2, 3, 4]', output: '10', explanation: '1 + 2 + 3 + 4 = 10.' },
      { input: 'values = [-2, 5, 0]', output: '3', explanation: 'Adding every value, including zero and negative values, gives 3.' }
    ],
    constraints: ['1 <= values.length <= 10^5', '-10^4 <= values[i] <= 10^4'],
    tags: ['Arrays', 'Running Total'],
    acceptanceRate: 78.4,
    sampleTestCases: [
      { input: '[1, 2, 3, 4]', expected: '10' },
      { input: '[-2, 5, 0]', expected: '3' }
    ],
    hint: 'Think about how to visit every element exactly once while keeping a running total.',
    options: [
      'Start at zero, add each element to a running total, and return the total.',
      'Sort the array and return its last element.',
      'Add only the first and last elements.',
      'Multiply every element together.'
    ],
    answer: 0,
    explanation: 'A single traversal with a running total includes each array value once.',
    starterCode: {
      Python: 'def array_sum(values):\n    # Add each value to a running total\n    pass',
      JavaScript: 'function arraySum(values) {\n  // Add each value to a running total\n}',
      Java: 'int arraySum(int[] values) {\n    // Add each value to a running total\n}',
      default: '// Write a function that returns the sum of all array values.'
    }
  },
  {
    id: 'loop-count',
    difficulty: 'Easy',
    topic: 'Loops',
    title: 'Counting loop iterations',
    prompt: 'A loop starts at 0 and runs while i < n, increasing i by 1 each time. How many times does its body run?',
    description: 'A counter starts at `0`. On each iteration, the loop body runs while `i < n`, then `i` increases by one. Determine the number of body executions.',
    examples: [
      { input: 'n = 4', output: '4', explanation: 'The body runs for i = 0, 1, 2, and 3.' },
      { input: 'n = 0', output: '0', explanation: 'The condition is false before the first iteration.' }
    ],
    constraints: ['0 <= n <= 10^9'],
    tags: ['Loops', 'Arrays'],
    acceptanceRate: 84.1,
    sampleTestCases: [
      { input: '4', expected: '4' },
      { input: '0', expected: '0' }
    ],
    hint: 'List the values of i that satisfy the condition, including the first one and excluding the stopping value.',
    options: ['n times', 'n - 1 times', 'n + 1 times', 'Once, regardless of n'],
    answer: 0,
    explanation: 'The loop visits 0 through n - 1, which is n values.',
    starterCode: { default: '// Trace the loop for n = 0, 1, and 4.' }
  },
  {
    id: 'linear-search',
    difficulty: 'Easy',
    topic: 'Searching',
    title: 'Finding a value',
    prompt: 'Which strategy correctly searches for a target in an unsorted array?',
    description: 'Given an unsorted integer array `values` and a target, return the index of the target. If it is not present, return `-1`.',
    examples: [
      { input: 'values = [4, 8, 2], target = 8', output: '1', explanation: 'The target is at index 1.' },
      { input: 'values = [4, 8, 2], target = 5', output: '-1', explanation: 'The target does not occur in the array.' }
    ],
    constraints: ['1 <= values.length <= 10^5', '-10^9 <= values[i], target <= 10^9'],
    tags: ['Arrays', 'Searching'],
    acceptanceRate: 63.7,
    sampleTestCases: [
      { input: 'values=[4,8,2], target=8', expected: '1' },
      { input: 'values=[4,8,2], target=5', expected: '-1' }
    ],
    hint: 'Without ordering information, consider what you must do before ruling out a value.',
    options: [
      'Check each element until the target is found or the array ends.',
      'Check only the middle element.',
      'Use binary search without sorting the array.',
      'Compare the first element with the array length.'
    ],
    answer: 0,
    explanation: 'A linear scan works for any ordering and checks each candidate at most once.',
    starterCode: { default: '// Return the index of target, or -1 if it is absent.' }
  },
  {
    id: 'binary-search',
    difficulty: 'Medium',
    topic: 'Searching',
    title: 'Binary search prerequisite',
    prompt: 'What condition must hold before standard binary search can safely discard half of the search range?',
    description: 'Given a sorted integer array `values` and a target, find the target index in logarithmic time. Return `-1` if it is absent.',
    examples: [
      { input: 'values = [-1, 0, 3, 5, 9, 12], target = 9', output: '4', explanation: 'Binary search narrows the sorted range to index 4.' },
      { input: 'values = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1', explanation: 'The target is not in the sorted array.' }
    ],
    constraints: ['1 <= values.length <= 10^5', 'values is sorted in strictly increasing order'],
    tags: ['Arrays', 'Binary Search'],
    acceptanceRate: 52.6,
    sampleTestCases: [
      { input: 'values=[-1,0,3,5,9,12], target=9', expected: '4' },
      { input: 'values=[-1,0,3,5,9,12], target=2', expected: '-1' }
    ],
    hint: 'The algorithm decides which half to discard by comparing values around the midpoint.',
    options: [
      'The input must be sorted according to the same ordering used by comparisons.',
      'The input must contain only positive values.',
      'The input must have an even number of elements.',
      'The target must be at the midpoint.'
    ],
    answer: 0,
    explanation: 'Sorted order makes the midpoint comparison informative about which half can contain the target.',
    starterCode: { default: '// Implement binary search over a sorted sequence.' }
  },
  {
    id: 'duplicate-detection',
    difficulty: 'Medium',
    topic: 'Hash sets',
    title: 'Detecting duplicates',
    prompt: 'Which approach detects whether an array contains a duplicate in expected O(n) time?',
    description: 'Given an integer array `values`, determine whether any value appears more than once. Aim for linear time.',
    examples: [
      { input: 'values = [1, 2, 3, 1]', output: 'true', explanation: 'The value 1 appears twice.' },
      { input: 'values = [1, 2, 3, 4]', output: 'false', explanation: 'Every value appears exactly once.' }
    ],
    constraints: ['1 <= values.length <= 10^5', '-10^9 <= values[i] <= 10^9'],
    tags: ['Arrays', 'Hash Table'],
    acceptanceRate: 58.2,
    sampleTestCases: [
      { input: '[1, 2, 3, 1]', expected: 'true' },
      { input: '[1, 2, 3, 4]', expected: 'false' }
    ],
    hint: 'Keep track of values already encountered and make membership checks efficient.',
    options: [
      'Scan once while storing seen values in a hash set.',
      'Compare every pair of elements.',
      'Sort the array using a quadratic sorting algorithm.',
      'Check only adjacent values without sorting.'
    ],
    answer: 0,
    explanation: 'A hash set supports expected constant-time membership checks, so one pass is expected O(n).',
    starterCode: { default: '// Return true as soon as a value has been seen before.' }
  },
  {
    id: 'sliding-window',
    difficulty: 'Medium',
    topic: 'Sliding window',
    title: 'Fixed-size window',
    prompt: 'You need the largest sum among all contiguous subarrays of length k. Which strategy avoids re-summing every window?',
    description: 'Given an integer array `values` and an integer `k`, return the maximum sum of any contiguous subarray of length `k`.',
    examples: [
      { input: 'values = [2, 1, 5, 1, 3, 2], k = 3', output: '9', explanation: 'The window [5, 1, 3] has the largest sum: 9.' },
      { input: 'values = [2, 3, 4, 1, 5], k = 2', output: '7', explanation: 'The window [3, 4] has the largest sum: 7.' }
    ],
    constraints: ['1 <= k <= values.length <= 10^5', '-10^4 <= values[i] <= 10^4'],
    tags: ['Arrays', 'Sliding Window'],
    acceptanceRate: 46.9,
    sampleTestCases: [
      { input: 'values=[2,1,5,1,3,2], k=3', expected: '9' },
      { input: 'values=[2,3,4,1,5], k=2', expected: '7' }
    ],
    hint: 'Compare two neighboring windows: most of their elements are shared.',
    options: [
      'Keep the current window sum; subtract the outgoing value and add the incoming value.',
      'Recalculate every window from scratch.',
      'Sort the values before choosing k elements.',
      'Keep only the largest individual element.'
    ],
    answer: 0,
    explanation: 'Each window update takes constant work, giving O(n) time after the first window sum.',
    starterCode: { default: '// Track the sum of each contiguous window of size k.' }
  },
  {
    id: 'topological-order',
    difficulty: 'Hard',
    topic: 'Graphs',
    title: 'Dependency ordering',
    prompt: 'A directed graph represents tasks and prerequisites. Which method can produce a valid ordering when the graph is acyclic?',
    description: 'Given a directed acyclic graph of `n` tasks and prerequisite edges, return a valid ordering in which each prerequisite appears before its dependent task.',
    examples: [
      { input: 'n = 4, edges = [[0, 1], [0, 2], [1, 3], [2, 3]]', output: '[0, 1, 2, 3] (one valid order)', explanation: 'Task 0 comes before 1 and 2, and both come before 3.' },
      { input: 'n = 2, edges = [[1, 0]]', output: '[1, 0]', explanation: 'Task 1 is the prerequisite for task 0.' }
    ],
    constraints: ['1 <= n <= 10^5', '0 <= edges.length <= 2 * 10^5', 'The graph is acyclic'],
    tags: ['Graph', 'Topological Sort'],
    acceptanceRate: 39.3,
    sampleTestCases: [
      { input: 'n=4, edges=[[0,1],[0,2],[1,3],[2,3]]', expected: 'Any valid topological order' },
      { input: 'n=2, edges=[[1,0]]', expected: '[1,0]' }
    ],
    hint: 'Repeatedly process vertices whose prerequisite count has reached zero, or use graph traversal finish times.',
    options: [
      'Kahn’s algorithm with indegrees, or DFS with reverse finishing order.',
      'Run binary search on the vertex labels.',
      'Sort vertices by their number of outgoing edges only.',
      'Use breadth-first search from an arbitrary vertex and ignore edges.'
    ],
    answer: 0,
    explanation: 'Both Kahn’s algorithm and DFS reverse postorder produce a topological ordering for a DAG.',
    starterCode: { default: '// Produce an ordering that places each prerequisite before its dependent task.' }
  },
  {
    id: 'dynamic-programming',
    difficulty: 'Hard',
    topic: 'Dynamic programming',
    title: 'Overlapping subproblems',
    prompt: 'A recursive solution repeatedly computes the same smaller states. What change most directly avoids this repeated work?',
    description: 'A recursive recurrence has overlapping subproblems. Design a solution that computes each distinct state once and reuses its result.',
    examples: [
      { input: 'fib(6)', output: '8', explanation: 'Memoizing each Fibonacci state avoids recomputing the same values.' },
      { input: 'fib(10)', output: '55', explanation: 'A bottom-up table computes the values from the base cases.' }
    ],
    constraints: ['0 <= n <= 10^5', 'Choose a representation that fits the required result range'],
    tags: ['Dynamic Programming', 'Memoization'],
    acceptanceRate: 35.8,
    sampleTestCases: [
      { input: '6', expected: '8' },
      { input: '10', expected: '55' }
    ],
    hint: 'Store a state’s result the first time it is computed and reuse it later.',
    options: [
      'Memoize computed states or fill a table in dependency order.',
      'Increase the recursion depth limit.',
      'Randomize the order of recursive calls.',
      'Copy the entire input before each recursive call.'
    ],
    answer: 0,
    explanation: 'Memoization and tabulation reuse subproblem results instead of recomputing them.',
    starterCode: { default: '// Define a state, its base case, and the transition between states.' }
  },
  {
    id: 'shortest-path',
    difficulty: 'Hard',
    topic: 'Graphs',
    title: 'Shortest paths with nonnegative weights',
    prompt: 'Which algorithm finds single-source shortest paths when all edge weights are nonnegative?',
    description: 'Given a weighted graph with nonnegative edge weights and a source vertex, compute the shortest distance from the source to every reachable vertex.',
    examples: [
      { input: 'edges = [[0,1,4], [0,2,1], [2,1,2]], source = 0', output: '[0, 3, 1]', explanation: 'The shortest route to vertex 1 goes through vertex 2.' },
      { input: 'edges = [[0,1,7], [1,2,3]], source = 0', output: '[0, 7, 10]', explanation: 'The path to vertex 2 has total weight 10.' }
    ],
    constraints: ['1 <= vertices <= 10^5', '0 <= edge weight <= 10^6', 'All edge weights are nonnegative'],
    tags: ['Graph', 'Shortest Path', 'Heap'],
    acceptanceRate: 31.4,
    sampleTestCases: [
      { input: 'edges=[[0,1,4],[0,2,1],[2,1,2]], source=0', expected: '[0,3,1]' },
      { input: 'edges=[[0,1,7],[1,2,3]], source=0', expected: '[0,7,10]' }
    ],
    hint: 'The algorithm repeatedly settles the not-yet-finalized vertex with the smallest tentative distance.',
    options: [
      'Dijkstra’s algorithm, typically with a min-priority queue.',
      'Depth-first search without tracking path costs.',
      'Topological sort on any graph.',
      'Binary search over the destination vertex.'
    ],
    answer: 0,
    explanation: 'Dijkstra’s algorithm is correct for nonnegative edge weights and commonly uses a min-priority queue.',
    starterCode: { default: '// Track tentative distances and repeatedly process the smallest one.' }
  }
];

const difficultyOrder = ['Easy', 'Medium', 'Hard'];
const progressVersion = 1;
const profileDirectoryKey = 'psriet-coding-profiles-v1';

function getProgressKey(studentId) {
  return `psriet-coding-progress-v${progressVersion}:${studentId || 'guest'}`;
}

export function getCodingProgress(studentId) {
  const storage = studentId === 'guest' ? window.sessionStorage : window.localStorage;
  const stored = storage.getItem(getProgressKey(studentId));
  if (!stored) {
    return { solvedIds: [], correctCount: 0, bestDifficulty: 'Easy', streakDays: 0, lastSolvedDate: null };
  }

  const progress = JSON.parse(stored);
  const validDifficulties = difficultyOrder;
  if (
    !progress ||
    !Array.isArray(progress.solvedIds) ||
    !progress.solvedIds.every((id) => typeof id === 'string') ||
    !Number.isInteger(progress.correctCount) ||
    progress.correctCount < 0 ||
    !validDifficulties.includes(progress.bestDifficulty) ||
    (progress.streakDays !== undefined && (!Number.isInteger(progress.streakDays) || progress.streakDays < 0)) ||
    (progress.lastSolvedDate !== undefined && progress.lastSolvedDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(progress.lastSolvedDate))
  ) {
    throw new Error('Saved coding progress is invalid. Clear this browser’s coding progress to continue.');
  }

  return {
    ...progress,
    streakDays: progress.streakDays || 0,
    lastSolvedDate: progress.lastSolvedDate || null,
    activityDates: Array.isArray(progress.activityDates) ? progress.activityDates : [],
    submissions: Array.isArray(progress.submissions) ? progress.submissions : []
  };
}

export function saveCodingProgress(studentId, progress, profileName = studentId) {
  const storage = studentId === 'guest' ? window.sessionStorage : window.localStorage;
  storage.setItem(getProgressKey(studentId), JSON.stringify(progress));
  if (studentId !== 'guest') {
    const profiles = JSON.parse(window.localStorage.getItem(profileDirectoryKey) || '{}');
    const solved = progress.solvedIds.length;
    const xp = solved * 100 + progress.streakDays * 10;
    profiles[studentId] = {
      id: studentId,
      name: profileName,
      solved,
      streakDays: progress.streakDays,
      xp,
      badge: getCodingBadge(xp),
      updatedAt: new Date().toISOString()
    };
    window.localStorage.setItem(profileDirectoryKey, JSON.stringify(profiles));
  }
}

export function getLeaderboard(currentStudentId) {
  const profiles = JSON.parse(window.localStorage.getItem(profileDirectoryKey) || '{}');
  const leaderboard = Object.values(profiles).map((profile) => {
    const progress = getCodingProgress(profile.id);
    const solved = progress.solvedIds.length;
    const xp = solved * 100 + progress.streakDays * 10;
    return {
      ...profile,
      solved,
      streakDays: progress.streakDays,
      xp,
      badge: xp >= 1000 ? 'Gold Algorithmist' : xp >= 500 ? 'Silver Bug Slayer' : xp >= 100 ? 'Bronze Coder' : 'Rising Coder',
      isCurrentStudent: profile.id === currentStudentId
    };
  });
  return leaderboard.sort((first, second) => second.xp - first.xp || second.solved - first.solved).slice(0, 10);
}

export async function syncGlobalCodingLeaderboard(user, profileName, progress) {
  if (!user?.id) return [];
  const solvedCount = progress.solvedIds.length;
  const xp = solvedCount * 100 + progress.streakDays * 10;
  const badge = getCodingBadge(xp);
  const { error: saveError } = await supabase
    .from('coding_leaderboard')
    .upsert({
      user_id: user.id,
      display_name: profileName,
      solved_count: solvedCount,
      streak_days: progress.streakDays,
      xp,
      badge,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  if (saveError) throw saveError;

  const { data, error: loadError } = await supabase
    .from('coding_leaderboard')
    .select('user_id, display_name, solved_count, streak_days, xp, badge')
    .order('xp', { ascending: false })
    .order('solved_count', { ascending: false })
    .limit(10);
  if (loadError) throw loadError;
  return data.map((entry) => ({
    id: entry.user_id,
    name: entry.display_name,
    solved: entry.solved_count,
    streakDays: entry.streak_days,
    xp: entry.xp,
    badge: entry.badge,
    isCurrentStudent: entry.user_id === user.id
  }));
}

export async function fetchNextQuestion({ difficulty, solvedIds, attemptedIds = [], topic = '', difficultyFilter = '', search = '', questionId = '' }) {
  if (questionId) {
    const dailyQuestion = questionBank.find((question) => question.id === questionId);
    return dailyQuestion ? pickQuestion([dailyQuestion]) : null;
  }

  const excludedIds = new Set([...solvedIds, ...attemptedIds]);
  const desiredIndex = difficultyOrder.indexOf(difficulty);
  const matchesFilters = (question) => {
    const topicMatches = !topic || question.tags.some((tag) => tag.toLowerCase() === topic.toLowerCase())
      || question.topic.toLowerCase() === topic.toLowerCase();
    const difficultyMatches = !difficultyFilter || question.difficulty === difficultyFilter;
    const searchMatches = !search
      || `${question.title} ${question.topic} ${question.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase());
    return topicMatches && difficultyMatches && searchMatches;
  };
  const availableByDifficulty = difficultyOrder.map((level) =>
    questionBank.filter((question) => question.difficulty === level && !excludedIds.has(question.id) && matchesFilters(question))
  );

  for (let index = desiredIndex; index < difficultyOrder.length; index += 1) {
    if (availableByDifficulty[index].length) return pickQuestion(availableByDifficulty[index]);
  }
  for (let index = desiredIndex - 1; index >= 0; index -= 1) {
    if (availableByDifficulty[index].length) return pickQuestion(availableByDifficulty[index]);
  }

  return null;
}

export function getQuestionTopics() {
  return [...new Set(questionBank.flatMap((question) => [question.topic, ...question.tags]))].sort();
}

export function getDailyQuestionId(date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  const dayNumber = day.split('-').join('').split('').reduce((sum, digit) => sum + Number(digit), 0);
  return questionBank[dayNumber % questionBank.length].id;
}

export function getQuestionEditorial(question) {
  const knownGuidance = {
    'binary-search': { time: 'O(log n)', space: 'O(1)', approach: 'Maintain low and high bounds. Compare the midpoint with the target, then discard the half that cannot contain it.' },
    'duplicate-detection': { time: 'O(n)', space: 'O(n)', approach: 'Scan once and add each value to a hash set. If a value is already present, a duplicate has been found.' },
    'sliding-window': { time: 'O(n)', space: 'O(1)', approach: 'Compute the first window sum, then slide one position at a time by subtracting the outgoing value and adding the incoming value.' },
    'topological-order': { time: 'O(V + E)', space: 'O(V + E)', approach: 'Track each vertex’s indegree, enqueue zero-indegree vertices, and decrement neighbors as vertices are removed.' },
    'dynamic-programming': { time: 'O(n)', space: 'O(n)', approach: 'Define a state for each prefix, establish base cases, then build each state from previously computed subproblems.' },
    'shortest-path': { time: 'O((V + E) log V)', space: 'O(V + E)', approach: 'Use Dijkstra’s algorithm with a min-priority queue. Relax outgoing edges whenever a shorter tentative path is found.' }
  };
  if (knownGuidance[question.id]) return knownGuidance[question.id];
  return {
    time: question.id === 'loop-count' ? 'O(1)' : 'O(n)',
    space: 'O(1)',
    approach: question.explanation
  };
}

export function getCodingBadge(xp) {
  if (xp >= 1000) return 'Gold Algorithmist';
  if (xp >= 500) return 'Silver Bug Slayer';
  if (xp >= 100) return 'Bronze Coder';
  return 'Rising Coder';
}

function pickQuestion(questions) {
  const question = questions[Math.floor(Math.random() * questions.length)];
  const shuffledOptions = question.options.map((option, index) => ({ option, index }));
  for (let index = shuffledOptions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledOptions[index], shuffledOptions[swapIndex]] = [shuffledOptions[swapIndex], shuffledOptions[index]];
  }

  return {
    ...question,
    options: shuffledOptions.map(({ option }) => option),
    answer: shuffledOptions.findIndex(({ index }) => index === question.answer)
  };
}

export function getStarterCode(question, language) {
  const genericTemplates = {
    Python: `def solve(input_data):\n    # ${question.title}\n    pass`,
    JavaScript: `function solve(inputData) {\n  // ${question.title}\n}`,
    'C++': `#include <bits/stdc++.h>\nusing namespace std;\n\n// ${question.title}\nint main() {\n    return 0;\n}`,
    Java: `class Solution {\n    // ${question.title}\n}`,
    TypeScript: `function solve(inputData: unknown): unknown {\n  // ${question.title}\n  return inputData;\n}`
  };
  return question.starterCode[language] || genericTemplates[language] || question.starterCode.default;
}

export function getNextDifficulty(difficulty) {
  const currentIndex = difficultyOrder.indexOf(difficulty);
  return difficultyOrder[Math.min(currentIndex + 1, difficultyOrder.length - 1)];
}

export const codingDifficulties = difficultyOrder;
export const codingLanguages = [
  'Python', 'JavaScript', 'C++', 'Java', 'TypeScript', 'C', 'C#', 'Go', 'Rust', 'PHP', 'Kotlin', 'Swift'
];
