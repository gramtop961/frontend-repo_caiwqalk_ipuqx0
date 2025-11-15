import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL

function TrackCard({ track, onOpen }){
  return (
    <button onClick={() => onOpen(track)} className="text-left w-full p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition bg-white">
      <div className="text-xs uppercase text-slate-500">Track</div>
      <div className="text-xl font-semibold">{track.title}</div>
      <div className="text-slate-600 mt-1">{track.description}</div>
      <div className="mt-2 flex gap-2 text-xs">
        {track.tags?.map(t => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{t}</span>
        ))}
      </div>
    </button>
  )
}

function LessonView({ lesson, onBack, onTakeQuiz }){
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <button onClick={onBack} className="text-sm text-slate-600 hover:text-slate-800">← Back</button>
      <h2 className="text-2xl font-bold mt-2">{lesson.title}</h2>
      <article className="prose prose-slate max-w-none mt-4 whitespace-pre-wrap">{lesson.content}</article>
      <div className="mt-6">
        <button onClick={onTakeQuiz} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Take Quiz</button>
      </div>
    </div>
  )
}

function QuizView({ lessonSlug, userEmail, onClose }){
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch(`${API}/lessons/${lessonSlug}/quiz`).then(r=>r.json()).then(setQuiz)
  }, [lessonSlug])

  const submit = async () => {
    const res = await fetch(`${API}/quizzes/${quiz._id}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: userEmail, answers })
    })
    const data = await res.json()
    setResult(data)
  }

  if(!quiz) return <div className="bg-white p-6 rounded-xl border">Loading quiz...</div>
  if(result) return (
    <div className="bg-white p-6 rounded-xl border">
      <h3 className="text-xl font-semibold">Result</h3>
      <p className="mt-2">Score: {result.score}% ({result.correct}/{result.total} correct)</p>
      <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg border">Close</button>
    </div>
  )

  return (
    <div className="bg-white p-6 rounded-xl border">
      <h3 className="text-xl font-semibold">{quiz.title}</h3>
      <div className="mt-4 space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={idx} className="">
            <div className="font-medium">{idx+1}. {q.prompt}</div>
            <div className="mt-2 grid gap-2">
              {q.options.map((op, i)=> (
                <label key={i} className={`border rounded-lg p-2 cursor-pointer ${answers[idx]===i? 'border-indigo-500 bg-indigo-50':'border-slate-200'}`}>
                  <input type="radio" name={`q-${idx}`} className="mr-2" onChange={()=>{
                    const next = [...answers]; next[idx]=i; setAnswers(next)
                  }} />
                  {op}
                </label>
              ))}
            </div>
            {q.explanation && <div className="text-xs text-slate-500 mt-2">Hint: {q.explanation}</div>}
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button onClick={submit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Submit</button>
        <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
      </div>
    </div>
  )
}

export default function App(){
  const [tracks, setTracks] = useState([])
  const [activeTrack, setActiveTrack] = useState(null)
  const [lessons, setLessons] = useState([])
  const [activeLesson, setActiveLesson] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [email, setEmail] = useState('learner@example.com')

  useEffect(()=>{
    fetch(`${API}/tracks`).then(r=>r.json()).then(setTracks)
  },[])

  const openTrack = async (track)=>{
    setActiveTrack(track)
    const res = await fetch(`${API}/tracks/${track.slug}/lessons`)
    const data = await res.json()
    setLessons(data)
  }

  const openLesson = async (lesson)=>{
    const res = await fetch(`${API}/lessons/${lesson.slug}`)
    const data = await res.json()
    setActiveLesson(data)
    setShowQuiz(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-xl">DB Learn</div>
          <div className="flex items-center gap-3">
            <input value={email} onChange={e=>setEmail(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Your email"/>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!activeTrack && (
          <>
            <h1 className="text-3xl font-bold">Learn Databases</h1>
            <p className="text-slate-600 mt-2">Pick a track to begin. Your quiz results are saved to track progress.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {tracks.map(t => <TrackCard key={t._id} track={t} onOpen={openTrack} />)}
            </div>
          </>
        )}

        {activeTrack && !activeLesson && (
          <div className="space-y-4">
            <button onClick={()=>setActiveTrack(null)} className="text-sm text-slate-600 hover:text-slate-800">← All tracks</button>
            <h2 className="text-2xl font-bold">{activeTrack.title}</h2>
            <div className="grid gap-3">
              {lessons.map(ls => (
                <button key={ls._id} onClick={()=>openLesson(ls)} className="text-left p-4 rounded-xl border bg-white hover:shadow-sm">
                  <div className="text-sm text-slate-500">Lesson</div>
                  <div className="font-semibold">{ls.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeLesson && !showQuiz && (
          <LessonView lesson={activeLesson} onBack={()=>setActiveLesson(null)} onTakeQuiz={()=>setShowQuiz(true)} />
        )}

        {activeLesson && showQuiz && (
          <QuizView lessonSlug={activeLesson.slug} userEmail={email} onClose={()=>setShowQuiz(false)} />
        )}
      </main>
    </div>
  )
}
