import { EquipmentTaxCalculator } from "@/components/newTnb";
import Nav from "@/components/Nav";
import FooterNav from "@/components/Footer";
import TnbSubImage from "@/Helper/TnbSubImage";
function page() {
  return (
    <div className=" justify-items-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-start sm:items-start">
        <Nav />
        <TnbSubImage />
        <EquipmentTaxCalculator />
        <FooterNav />
      </main>
    </div>
    )
}

export default page