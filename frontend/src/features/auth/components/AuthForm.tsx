import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GithubMark } from '@/components/ui/GithubMark'

export type AuthMode = 'signin' | 'signup'

type Fields = { name: string; email: string; password: string }
type Errors = Partial<Record<keyof Fields, string>>

const copy = {
  signin: {
    heading: 'Sign in',
    subheading: 'Pick up the tours you have already generated.',
    submit: 'Sign in',
    github: 'Continue with GitHub',
    switchPrompt: 'No account yet?',
    switchLabel: 'Create one',
    switchTo: '/signup',
  },
  signup: {
    heading: 'Create an account',
    subheading: 'Point CodeCompass at a repository and get a reading path.',
    submit: 'Create account',
    github: 'Sign up with GitHub',
    switchPrompt: 'Already have an account?',
    switchLabel: 'Sign in',
    switchTo: '/login',
  },
} as const

function validate(mode: AuthMode, values: Fields): Errors {
  const errors: Errors = {}

  if (mode === 'signup' && values.name.trim().length < 2) {
    errors.name = 'Enter your name.'
  }

  if (!values.email.trim()) {
    errors.email = 'Enter your email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'That does not look like an email address.'
  }

  if (!values.password) {
    errors.password = 'Enter your password.'
  } else if (mode === 'signup' && values.password.length < 8) {
    errors.password = 'Use at least 8 characters.'
  }

  return errors
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const text = copy[mode]
  const navigate = useNavigate()

  const [values, setValues] = useState<Fields>({
    name: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  // Fields validate only after the first submit attempt, so nobody is shouted
  // at for a half-typed email address.
  const [submitted, setSubmitted] = useState(false)

  const update = (field: keyof Fields) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: event.target.value }
    setValues(next)
    if (submitted) setErrors(validate(mode, next))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)

    const found = validate(mode, values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Move focus to the first field that failed, so a keyboard or screen
      // reader user lands on the problem instead of hunting for it.
      const firstField = (['name', 'email', 'password'] as const).find((f) => found[f])
      if (firstField) document.getElementById(firstField)?.focus()
      return
    }

    // No auth backend yet (module M8). The real call goes here; until then the
    // form hands off to the dashboard so the flow is walkable end to end.
    navigate('/dashboard')
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-mono text-3xl font-bold tracking-tight">{text.heading}</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
        {text.subheading}
      </p>

      {/* GitHub first: the repositories being analysed already live there. */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="mt-8 w-full"
        onClick={() => navigate('/dashboard')}
      >
        <GithubMark />
        {text.github}
      </Button>

      <div className="my-6 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-xs text-ink-faint">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {mode === 'signup' && (
          <Input
            id="name"
            name="name"
            label="Name"
            autoComplete="name"
            value={values.name}
            onChange={update('name')}
            error={errors.name}
          />
        )}

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="you@college.edu"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
        />

        <div>
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={values.password}
            onChange={update('password')}
            error={errors.password}
            hint={mode === 'signup' ? 'At least 8 characters.' : undefined}
          />
          {mode === 'signin' && (
            <div className="mt-2 text-right">
              <Link
                to="/login"
                className="font-mono text-xs text-ink-faint transition-colors duration-200 hover:text-accent"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="mt-1 w-full">
          <Mail className="size-4" aria-hidden="true" />
          {text.submit}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-ink-muted">
        {text.switchPrompt}{' '}
        <Link
          to={text.switchTo}
          className="font-medium text-accent transition-colors duration-200 hover:text-accent-hover"
        >
          {text.switchLabel}
        </Link>
      </p>
    </div>
  )
}
