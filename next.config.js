/** @type {import('next').NextConfig} */

// Os aliases de webpack que apontavam @clerk e @mux para arquivos falsos
// foram removidos. O que decide entre simulado e real agora é a variável
// NEXT_PUBLIC_MOCK_MODE, lida em lib/config.ts — nenhuma configuração de
// build precisa mudar quando as chaves reais entrarem.

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io' },              // UploadThing
      { protocol: 'https', hostname: 'images.unsplash.com' },  // imagens de exemplo
      { protocol: 'https', hostname: 'aluminigreen.org' },
      { protocol: 'https', hostname: '**.b-cdn.net' },         // thumbnails do Bunny
    ],
  },
};

module.exports = nextConfig;
