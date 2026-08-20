// Découpage administratif du Bénin : 12 départements, 77 communes.
export const BENIN_DEPARTEMENTS = [
  { departement: "Alibori", communes: ["Banikoara", "Gogounou", "Kandi", "Karimama", "Malanville", "Ségbana"] },
  { departement: "Atacora", communes: ["Boukoumbé", "Cobly", "Kérou", "Kouandé", "Matéri", "Natitingou", "Péhunco", "Tanguiéta", "Toucountouna"] },
  { departement: "Atlantique", communes: ["Abomey-Calavi", "Allada", "Kpomassè", "Ouidah", "Sô-Ava", "Toffo", "Tori-Bossito", "Zè"] },
  { departement: "Borgou", communes: ["Bembéréké", "Kalalé", "N'Dali", "Nikki", "Parakou", "Pérèrè", "Sinendé", "Tchaourou"] },
  { departement: "Collines", communes: ["Bantè", "Dassa-Zoumè", "Glazoué", "Ouèssè", "Savalou", "Savè"] },
  { departement: "Couffo", communes: ["Aplahoué", "Djakotomey", "Dogbo", "Klouékanmè", "Lalo", "Toviklin"] },
  { departement: "Donga", communes: ["Bassila", "Copargo", "Djougou", "Ouaké"] },
  { departement: "Littoral", communes: ["Cotonou"] },
  { departement: "Mono", communes: ["Athiémé", "Bopa", "Comè", "Grand-Popo", "Houéyogbé", "Lokossa"] },
  { departement: "Ouémé", communes: ["Adjarra", "Adjohoun", "Aguégués", "Akpro-Missérété", "Avrankou", "Bonou", "Dangbo", "Porto-Novo", "Sèmè-Kpodji"] },
  { departement: "Plateau", communes: ["Adja-Ouèrè", "Ifangni", "Kétou", "Pobè", "Sakété"] },
  { departement: "Zou", communes: ["Abomey", "Agbangnizoun", "Bohicon", "Covè", "Djidja", "Ouinhi", "Za-Kpota", "Zagnanado", "Zogbodomey"] },
];

export const ALL_COMMUNES = BENIN_DEPARTEMENTS.flatMap((d) => d.communes);
