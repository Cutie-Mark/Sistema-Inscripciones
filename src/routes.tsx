import React from 'react';
import {
  createBrowserRouter,      // mantiene el nombre original de la función
  RouterProvider,           // idem
  RouteObject               // tipo de React-Router
} from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';

// 1. Carga lazy de todas las páginas (*.tsx) dentro de /views
const paginas = import.meta.glob('./views/**/*.tsx');

// 2. Prefijos cuyas rutas deben estar protegidas
const prefijosProtegidos = ['/admin', '/usuario', '/subir'];

// 3. Tipo auxiliar para los módulos de página
interface ModuloPagina {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: React.ComponentType<any>;
}

// 4. Listas de rutas públicas y protegidas
const rutasPublicas: RouteObject[] = [];
const rutasProtegidas: RouteObject[] = [];

// 5. Recorre cada archivo y construye su definición de ruta
Object.entries(paginas).forEach(([rutaArchivo, importador]) => {
  // --> Genera la URL a partir de la ruta del archivo
  const ruta = rutaArchivo
    .replace('./views', '')            // quita la base
    .replace(/\.tsx$/, '')             // quita extensión
    .replace(/\/(pagina|index)$/, '')  // quita “pagina” o “index”
    .replace(/\[(\w+)\]/g, ':$1')      // convierte [id] -> :id
    || '/';

  // --> Crea el objeto de ruta con carga perezosa
  const definicionRuta: RouteObject = {
    path: ruta,
    lazy: async () => {
      const modulo = await (importador() as Promise<ModuloPagina>);
      return { Component: modulo.default };
    }
  };

  // --> Clasifica la ruta como protegida o pública
  if (prefijosProtegidos.some(pref => ruta.startsWith(pref))) {
    rutasProtegidas.push(definicionRuta);
  } else {
    rutasPublicas.push(definicionRuta);
  }
});

// 6. Construye el enrutador de la aplicación
const enrutador = createBrowserRouter(
  [
    ...rutasPublicas,
    {
      element: <PrivateRoute />,
      children: rutasProtegidas
    },
    // Ruta 404 genérica (si existe)
    paginas['./views/404.tsx'] && {
      path: '*',
      lazy: async () => {
        const modulo = await (import('./views/404.tsx') as Promise<ModuloPagina>);
        return { Component: modulo.default };
      }
    }
  ].filter(Boolean) as RouteObject[]
);

// 7. Componente contenedor del enrutador
export default function EnrutadorApp() {
  return <RouterProvider router={enrutador} />;
}
