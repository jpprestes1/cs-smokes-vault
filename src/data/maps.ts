// Interface que define o formato exato que um Mapa deve ter
export interface MapData {
  id: string; // Usado para a URL (ex: "mirage")
  name: string; // Nome de exibição (ex: "MIRAGE")
  grenades: string; // Quantidade de granadas
  image: string; // Imagem que aparece nos cards
  radarImage: string; // Imagem top-down que aparece na tela de detalhes
}

// O banco de dados centralizado dos mapas
export const mapsDatabase: MapData[] = [
  {
    id: 'mirage',
    name: 'MIRAGE',
    grenades: '1,204 Grenade',
    image:
      'https://static.wikia.nocookie.net/cswikia/images/f/f5/De_mirage_cs2.png/revision/latest?cb=20230807124319',
    radarImage:
      'https://community.skin.club/wp-content/themes/skinclub-v3/assets/images/maps/mirage.webp', // Placeholder
  },
  {
    id: 'inferno',
    name: 'INFERNO',
    grenades: '983 Grenade',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB_lvxKPz3Td3SDbJ75CxKkrVI7oQdYivTttTVu2CF5A&s=10',
    radarImage:
      'https://community.skin.club/wp-content/themes/skinclub-v3/assets/images/maps/inferno.webp', // Placeholder
  },
  {
    id: 'dust-2',
    name: 'DUST 2',
    grenades: '845 Grenade',
    image: 'https://csmarket.gg/blog/wp-content/uploads/2024/04/Dust_II_CS-GO.webp',
    radarImage:
      'https://community.skin.club/wp-content/themes/skinclub-v3/assets/images/maps/dust.webp', // Placeholder
  },
  {
    id: 'ancient',
    name: 'ANCIENT',
    grenades: '612 Grenade',
    image: 'https://img.nsctotal.com.br/wp-content/uploads/2025/08/ancient-2.jpg',
    radarImage:
      'https://community.skin.club/wp-content/themes/skinclub-v3/assets/images/maps/ancient.webp', // Placeholder
  },
  {
    id: 'nuke',
    name: 'NUKE',
    grenades: '732 Grenade',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuyVYXP2oavtjevOql9dSEIGgSr_YPiJZ6ok8v1FAI1kjTKi_6LbexTIdC&s=10',
    radarImage:
      'https://community.skin.club/wp-content/themes/skinclub-v3/assets/images/maps/nuke.webp', // Placeholder
  },
  {
    id: 'anubis',
    name: 'ANUBIS',
    grenades: '732 Grenade',
    image: 'https://i.redd.it/z3qkwikoygpf1.jpeg',
    radarImage:
      'https://community.skin.club/wp-content/themes/skinclub-v3/assets/images/maps/anubis.webp', // Placeholder
  },
  {
    id: 'cache',
    name: 'CACHE',
    grenades: '732 Grenade',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbBA4PsEfvTB54gEWxSQUY1A64ucq58x1I0_7ZYLPqT9NgkION8mDxdgo&s=10',
    radarImage:
      'https://community.skin.club/wp-content/themes/skinclub-v3/assets/images/maps/cache.webp', // Placeholder
  },
  {
    id: 'overpass',
    name: 'OVERPASS',
    grenades: '732 Grenade',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZe5VRtM9EPX0sbxHqV0SfUtKy9xJSgBfCvE3BomcbgSvYuy1GPbMnjGY&s=10',
    radarImage:
      'https://community.skin.club/wp-content/themes/skinclub-v3/assets/images/maps/overpass.webp', // Placeholder
  },
];
