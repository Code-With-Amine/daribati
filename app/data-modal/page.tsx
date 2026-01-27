"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import Nav from "@/components/Nav";

interface ResultItem {
  id: string;
  Lieu: string;
  ZoneFr: string;
  Evaluation: string[];
}

export default function AllDataTable() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [data, setData] = useState<ResultItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLieu, setEditLieu] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Fetch data from Firestore on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "results"));
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ResultItem[];
        setData(docs);
      } catch (err) {
        console.error("Error fetching from Firestore:", err);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const matchesSearch = item.Lieu.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !filterCategory || item.ZoneFr === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item: ResultItem) => {
    setEditId(item.id);
    setEditLieu(item.Lieu);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    try {
      const ref = doc(db, "results", editId);
      await updateDoc(ref, { Lieu: editLieu });

      setData((prev) =>
        prev.map((item) =>
          item.id === editId ? { ...item, Lieu: editLieu } : item
        )
      );
      setEditId(null);
      setEditLieu("");
    } catch (err) {
      console.error("Error updating document:", err);
    }
  };

  const onDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId) {
      try {
        await deleteDoc(doc(db, "results", pendingDeleteId));
        setData((prev) => prev.filter((item) => item.id !== pendingDeleteId));
      } catch (err) {
        console.error("Erreur de suppression :", err);
      }
      setPendingDeleteId(null);
    }
    setConfirmOpen(false);
  };

  const handleDownloadPDF = async () => {
    const loadImageAsDataUrl = async (url: string) => {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        return await new Promise<string | ArrayBuffer | null>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (err) {
        console.warn("Could not load image", url, err)
        return null
      }
    }

    const docPDF = new jsPDF({ orientation: "landscape" });

    // attempt to add the shared logo and center it at the top
  const imgData = await loadImageAsDataUrl("/TNBLogo.png")
    if (imgData) {
      try {
        const pageWidth = (docPDF.internal?.pageSize?.getWidth && docPDF.internal.pageSize.getWidth()) || (docPDF.internal?.pageSize?.width as number) || 842
        const imgW = 64
        const imgH = 64
        const x = (pageWidth - imgW) / 2
        const y = 10
        docPDF.addImage(imgData as string, "PNG", x, y, imgW, imgH)
      } catch (e) {
        console.warn("Failed to add logo to PDF:", e)
      }
    }

    // header text placed under the logo
    docPDF.text("Toutes les données", 14, 90);
    const tableColumn = ["Lieu", "Zone", "Critères"];
    const tableRows = filteredData.map((item) => [
      item.Lieu,
      item.ZoneFr,
      item.Evaluation.join("\n"),
    ]);
    autoTable(docPDF, { head: [tableColumn], body: tableRows, startY: 110 });
    docPDF.save("tnb-table.pdf");
  };

  return (
      <div className=" justify-items-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-start sm:items-start">
        <Nav />
    <div className="max-w-[1800px] w-[98vw] mx-auto h-[85vh] overflow-y-auto my-7 p-4">
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Recherche par lieu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          <option value="Zone bien équipée (15 - 30 DH/m²)">Zone bien équipée</option>
          <option value="Zone moyennement équipée (5 - 15 DH/m²)">Zone moyennement équipée</option>
          <option value="Zone faiblement équipée (0.5 - 2 DH/m²)">Zone faiblement équipée</option>
        </select>
        <Button variant="outline" onClick={handleDownloadPDF}>
          Télécharger PDF
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lieu</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Critères</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {editId === item.id ? (
                    <Input
                      value={editLieu}
                      onChange={(e) => setEditLieu(e.target.value)}
                      className="w-32"
                    />
                  ) : (
                    item.Lieu
                  )}
                </TableCell>
                <TableCell>{item.ZoneFr}</TableCell>
                <TableCell>
                  {item.Evaluation.map((ev, i) => (
                    <React.Fragment key={i}>
                      {ev}
                      {i < item.Evaluation.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </TableCell>
                <TableCell className="flex gap-2">
                  {editId === item.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleUpdate}
                      >
                        Enregistrer
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditId(null)}
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteClick(item.id)}
                      >
                        Supprimer
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-md">
            <h2 className="text-lg font-bold mb-2">Confirmer la suppression</h2>
            <div className="mb-4">
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est
              irréversible.
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
      </main>
    </div>
  );
}
