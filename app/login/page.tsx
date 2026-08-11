import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-semibold text-stone-800">Ingresar</h1>
          <p className="text-stone-500 text-sm mt-1">Panel de administración</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
