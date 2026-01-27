import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TnbSubImage() {
    const logoSrc = "/landSubtitle.png";
    const logoAlt = "Land Subtitle Image";
    const subtext = "Renseignez les informations requises pour calculer la taxe.";
  return (
    <div className="w-full mx-auto mt-4">
     <div className="cursor-pointer">
              <img src={logoSrc} alt={logoAlt} className="d-block mx-auto w-100"/>
            </div>
            <p className="text-center mt-10">{subtext}</p>
    </div>
  );
}
