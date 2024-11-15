import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const navigate = useNavigate()


const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (username === 'admin' && password === '123') {
        console.log('Login exitoso')
        navigate('/dashboard')
    } else {
        console.log('Usuario o contraseña incorrectos')
        setIsErrorModalOpen(true)
    }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#291471]">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-6">
            <img
              src='../src/img/465017188_122186267120224984_2697486536036591788_n.jpg'
              alt="Logo del Colegio"
              width={200}
              height={200}
              className="rounded-full"
            />
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors"
            >
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full text-gray-600">
            ¿Olvidó su contraseña? Contacte al administrador
          </p>
        </CardFooter>
      </Card>
      <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#291471]">Error de autenticación</DialogTitle>
            <DialogDescription>
              Usuario o contraseña incorrectos. Por favor, intente nuevamente.
            </DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => setIsErrorModalOpen(false)}
            className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors"
          >
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
