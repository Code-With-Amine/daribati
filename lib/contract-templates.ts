export function extractPlaceholders(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const placeholders: string[] = []
  let match
  while ((match = regex.exec(template)) !== null) {
    if (!placeholders.includes(match[1])) {
      placeholders.push(match[1])
    }
  }
  return placeholders
}

export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key] || `{{${key}}}`
  })
}

export function buildDossierContextVars(dossier: any): Record<string, string> {
  return {
    DOSSIER_NUMBER: dossier.dossierNumber || '',
    TITLE: dossier.title || '',
    LAND_REF: dossier.landRef || '',
    STATUS: dossier.status || '',
    CLIENT_NAME: dossier.client?.name || '',
    CLIENT_EMAIL: dossier.client?.email || '',
    CLIENT_PHONE: dossier.client?.phone || '',
    CLIENT_CIN: dossier.client?.cin || '',
    NOTAIRE_NAME: dossier.createdBy?.name || '',
    DATE: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    YEAR: new Date().getFullYear().toString(),
  }
}

export const BUILT_IN_TEMPLATES = [
  {
    name: 'Contrat de Vente Immobilière',
    description: 'Acte de vente standard pour bien immobilier entre particuliers',
    category: 'vente',
    content: `CONTRAT DE VENTE IMMOBILIÈRE

Le {{DATE}},

Entre les soussignés :

Monsieur/Madame {{SELLER_NAME}}, {{SELLER_CIN}}, demeurant à {{SELLER_ADDRESS}},
ci-après dénommé "Le Vendeur",

D'une part,

ET

Monsieur/Madame {{BUYER_NAME}}, {{BUYER_CIN}}, demeurant à {{BUYER_ADDRESS}},
ci-après dénommé "L'Acquéreur",

D'autre part,

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :

Article 1 - DÉSIGNATION DU BIEN
Le Vendeur vend à l'Acquéreur, qui accepte, le bien immobilier sis à {{PROPERTY_ADDRESS}}, cadastré sous le numéro {{CADASTRE_NUM}}, d'une superficie de {{SURFACE}} m².

Article 2 - PRIX
La vente est consentie et acceptée au prix de {{PRICE}} Dirhams, payé comptant ce jour.

Article 3 - ORIGINE DE PROPRIÉTÉ
Le Vendeur déclare avoir acquis le bien selon acte reçu par [Notaire] en date du [Date].

Article 4 - CHARGES ET CONDITIONS
Le Vendeur déclare que le bien est libre de toute hypothèque et servitude.

Article 5 - FRAIS
Tous les frais, droits et émoluments du présent acte sont à la charge de l'Acquéreur.

Article 6 - JOUISSANCE
L'Acquéreur aura la jouissance du bien à compter de la signature du présent acte.

Fait à l'étude de Maître {{NOTAIRE_NAME}}, le {{DATE}}.

Le Vendeur                    L'Acquéreur`,
  },
  {
    name: 'Contrat de Location (Bail)',
    description: 'Bail locatif standard pour logement ou local commercial',
    category: 'location',
    content: `CONTRAT DE LOCATION

Le {{DATE}},

Entre les soussignés :

Monsieur/Madame {{LANDLORD_NAME}}, {{LANDLORD_CIN}}, demeurant à {{LANDLORD_ADDRESS}},
ci-après dénommé "Le Bailleur",

D'une part,

ET

Monsieur/Madame {{TENANT_NAME}}, {{TENANT_CIN}}, demeurant à {{TENANT_ADDRESS}},
ci-après dénommé "Le Locataire",

D'autre part,

IL A ÉTÉ CONVENU CE QUI SUIT :

Article 1 - OBJET DU BAIL
Le Bailleur donne en location au Locataire, qui accepte, le bien situé à {{PROPERTY_ADDRESS}}.

Article 2 - DURÉE
Le présent bail est consenti pour une durée de {{DURATION}} mois, à compter du {{START_DATE}}, pour se terminer le {{END_DATE}}.

Article 3 - LOYER
Le loyer mensuel est fixé à {{RENT}} Dirhams, payable d'avance le 1er de chaque mois.

Article 4 - DÉPÔT DE GARANTIE
Le Locataire verse au Bailleur un dépôt de garantie de {{DEPOSIT}} Dirhams, restitué en fin de bail sous déduction des sommes dues.

Article 5 - CHARGES
Les charges locatives sont à la charge du Locataire.

Fait à {{CITY}}, le {{DATE}}.

Le Bailleur                    Le Locataire`,
  },
  {
    name: 'Acte de Donation',
    description: 'Acte de donation entre vifs pour bien immobilier',
    category: 'donation',
    content: `ACTE DE DONATION

Le {{DATE}},

Entre les soussignés :

Monsieur/Madame {{DONOR_NAME}}, {{DONOR_CIN}}, demeurant à {{DONOR_ADDRESS}},
ci-après dénommé "Le Donateur",

D'une part,

ET

Monsieur/Madame {{DONEE_NAME}}, {{DONEE_CIN}}, demeurant à {{DONEE_ADDRESS}},
ci-après dénommé "Le Donataire",

D'autre part,

EXPOSÉ PRÉLIMINAIRE
Le Donateur déclare vouloir, par les présentes, faire donation entre vifs au Donataire, qui accepte, du bien immobilier ci-après désigné.

IL A ÉTÉ CONVENU CE QUI SUIT :

Article 1 - BIEN DONNÉ
Le Donateur donne et cède au Donataire le bien immobilier sis à {{PROPERTY_ADDRESS}}, d'une superficie de {{SURFACE}} m².

Article 2 - CAUSE DE LA DONATION
La présente donation est faite pour [motif de la donation].

Article 3 - ACQUITTEMENT DES CHARGES
Le Donataire s'acquittera de tous les droits et taxes dus à raison de la présente donation.

Fait à l'étude de Maître {{NOTAIRE_NAME}}, le {{DATE}}.

Le Donateur                    Le Donataire`,
  },
  {
    name: 'Constitution de Société',
    description: 'Statuts de constitution de société à responsabilité limitée (SARL)',
    category: 'constitution',
    content: `STATUTS DE SOCIÉTÉ À RESPONSABILITÉ LIMITÉE

Le {{DATE}},

ENTRE LES SOUSSIGNÉS :

1. Monsieur/Madame {{PARTNER1_NAME}}, {{PARTNER1_CIN}}, demeurant à {{PARTNER1_ADDRESS}}
2. Monsieur/Madame {{PARTNER2_NAME}}, {{PARTNER2_CIN}}, demeurant à {{PARTNER2_ADDRESS}}

IL A ÉTÉ ARRÊTÉ CE QUI SUIT :

TITRE I - FORME - OBJET - DÉNOMINATION - SIÈGE - DURÉE

Article 1 - FORME
Il est formé une Société à Responsabilité Limitée (SARL).

Article 2 - OBJET
La Société a pour objet : {{COMPANY_OBJECT}}.

Article 3 - DÉNOMINATION
La Société a pour dénomination : {{COMPANY_NAME}}.

Article 4 - SIÈGE SOCIAL
Le siège social est fixé à {{COMPANY_ADDRESS}}.

Article 5 - DURÉE
La durée de la Société est de {{DURATION}} ans.

TITRE II - APPORTS - CAPITAL SOCIAL - PARTS SOCIALES

Article 6 - APPORTS
Chaque associé apporte :
- {{PARTNER1_NAME}} : {{PARTNER1_CONTRIBUTION}} Dirhams
- {{PARTNER2_NAME}} : {{PARTNER2_CONTRIBUTION}} Dirhams

Article 7 - CAPITAL SOCIAL
Le capital social est fixé à {{CAPITAL}} Dirhams, divisé en {{SHARES}} parts sociales de {{SHARE_VALUE}} Dirhams chacune.

TITRE III - GÉRANCE

Article 8 - GÉRANT
La Société est gérée par {{MANAGER_NAME}}.

Fait à {{CITY}}, le {{DATE}}.

Les Associés`,
  },
]
