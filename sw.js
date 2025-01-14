importScripts('js/sw-utils.js')


const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v2'
const INMUTABLE_CACHE = 'inmutable-v1'

const APP_SHELL = [
    //'./',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'manifest.json'
]

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,30',
    'css/animate.css',
    'js/libs/jquery.js'
]

self.addEventListener('install', e => {
    const cacheStatic = caches.open(STATIC_CACHE).then(cache =>
        cache.addAll(APP_SHELL).catch(err => {
            console.error('fallo en cacheStatic:', err)
        })
    )

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache =>
        cache.addAll(APP_SHELL_INMUTABLE).catch(err => {
            console.error('fallo en cacheInmutable:', err)
        })
    )

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]))
})

self.addEventListener('activate', e => {
    const respuesta = caches.keys().then(keys => {
        return Promise.all(
            keys.map(key => {
                if (key != STATIC_CACHE && key.includes('static')) {
                    return caches.delete(key)
                }

                if (key != DYNAMIC_CACHE && key.includes('dynamic')) {
                    return caches.delete(key)
                }
            })
        )
    })
    e.waitUntil(respuesta)
})

self.addEventListener('fetch', e => {
    const respuesta = caches.match(e.request).then(res => {
        if (res) {
            return res
        } else {
            return fetch(e.request).then(newRes => {
                return actualizarCacheDinamico(DYNAMIC_CACHE, e.request, newRes)
            })
        }
    })
    e.respondWith(respuesta)
})
