import { useEffect, useState } from "react";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function SortableProductCard({ product, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    width: "320px",
    background: "#fafafa",
    border: "1px solid #ddd",
    borderRadius: "18px",
    padding: "18px",
    cursor: "grab",
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        style={{
          width: "100%",
          height: "260px",
          background: "#eee",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "14px",
        }}
      >
        <img
          src={product.image}
          alt={product.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div style={{ color: "#777", marginBottom: "8px", fontSize: "14px" }}>
        #{index + 1}
      </div>

      <h3 style={{ margin: 0, marginBottom: "10px", fontSize: "18px" }}>
        {product.title}
      </h3>

      <div
        style={{
          color: product.stock <= 0 ? "#d72c0d" : "#008060",
          fontWeight: "600",
          marginBottom: "6px",
        }}
      >
        Stok: {product.stock}
      </div>

      <div style={{ fontWeight: "700", fontSize: "16px" }}>
        {product.price} ₺
      </div>
    </div>
  );
}

export default function Index() {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    const filtered = collections.filter((collection) =>
      collection.title.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredCollections(filtered);
  }, [search, collections]);

  async function fetchCollections() {
    const response = await fetch("/api/collections");
    const data = await response.json();

    setCollections(data.collections || []);
    setFilteredCollections(data.collections || []);
  }

  async function openSorter(collection) {
    setSelectedCollection(collection);
    setProducts([]);

    const response = await fetch(
      `/api/products?collectionId=${collection.id}`
    );

    const data = await response.json();

    setProducts(data.products || []);
  }

  function closeSorter() {
    setSelectedCollection(null);
    setProducts([]);
  }

  function moveOutOfStockToBottom() {
    const inStock = products.filter((product) => product.stock > 0);
    const outOfStock = products.filter((product) => product.stock <= 0);

    setProducts([...inStock, ...outOfStock]);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = products.findIndex((product) => product.id === active.id);
    const newIndex = products.findIndex((product) => product.id === over.id);

    setProducts((items) => arrayMove(items, oldIndex, newIndex));
  }

  async function saveOrder() {
    if (!selectedCollection) {
      alert("Koleksiyon seçili değil.");
      return;
    }

    const response = await fetch("/api/save-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collectionId: selectedCollection.id,
        products,
      }),
    });

    const data = await response.json();

    const errors =
      data?.data?.collectionReorderProducts?.userErrors || [];

    if (errors.length > 0) {
      alert(errors[0].message);
      return;
    }

    alert("Sıralama Shopify'a kaydedildi.");
  }

  return (
    <div
      style={{
        padding: "40px",
        background: "#f6f6f7",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "#dff5e8",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700" }}>
          Collection Sort Master
        </h1>

        <p style={{ marginTop: "10px", color: "#555" }}>
          {collections.length} koleksiyon mevcut.
        </p>
      </div>

      <input
        type="text"
        placeholder="Koleksiyon ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          marginBottom: "25px",
          fontSize: "16px",
        }}
      />

      {filteredCollections.map((collection) => (
        <div
          key={collection.id}
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #e5e5e5",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "20px" }}>
              {collection.title}
            </h2>

            <p style={{ marginTop: "8px", color: "#777" }}>
              Manuel sıralama
            </p>
          </div>

          <button
            onClick={() => openSorter(collection)}
            style={{
              background: "#111",
              color: "white",
              border: "none",
              padding: "14px 22px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            Sort
          </button>
        </div>
      ))}

      {selectedCollection && (
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            marginTop: "40px",
            border: "1px solid #ddd",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "30px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "28px" }}>
                {selectedCollection.title}
              </h2>

              <p style={{ marginTop: "10px", color: "#777", fontSize: "16px" }}>
                Ürünleri sürükleyerek sıralayın
              </p>
            </div>

            <div>
              <button
                onClick={moveOutOfStockToBottom}
                style={{
                  background: "#111",
                  color: "white",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginRight: "10px",
                }}
              >
                Tükenenleri Sona Taşı
              </button>

              <button
                onClick={saveOrder}
                style={{
                  background: "#008060",
                  color: "white",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginRight: "10px",
                }}
              >
                Kaydet
              </button>

              <button
                onClick={closeSorter}
                style={{
                  background: "#eee",
                  color: "#111",
                  border: "1px solid #ddd",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Kapat
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <p>Ürünler yükleniyor...</p>
          ) : (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={products.map((product) => product.id)}
                strategy={rectSortingStrategy}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {products.map((product, index) => (
                    <SortableProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}