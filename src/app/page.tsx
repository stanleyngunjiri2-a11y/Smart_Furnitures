"use client";

import { useState } from "react";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

const WHATSAPP_NUMBER = "254790753642";

const products = [
  {
    id: 1,
    name: "The Sculpted Lounge",
    category: "Sofas",
    price: 48500,
    oldPrice: 55000,
    badge: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85",
    description: "Contemporary comfort with timeless character.",
  },
  {
    id: 2,
    name: "Nordic Comfort Chair",
    category: "Chairs",
    price: 24500,
    oldPrice: null,
    badge: "NEW ARRIVAL",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85",
    description: "A considered expression of everyday comfort.",
  },
  {
    id: 3,
    name: "Minimalist Coffee Table",
    category: "Tables",
    price: 32000,
    oldPrice: 38000,
    badge: "SPECIAL OFFER",
    image:
      "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=1000&q=85",
    description: "Clean lines. Beautiful simplicity.",
  },
  {
    id: 4,
    name: "The Haven Sofa",
    category: "Sofas",
    price: 89500,
    oldPrice: null,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=1000&q=85",
    description: "An inviting centrepiece for modern living.",
  },
  {
    id: 5,
    name: "Contemporary Accent Chair",
    category: "Chairs",
    price: 28500,
    oldPrice: 33000,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1598300053653-4c7c4e9c5b17?auto=format&fit=crop&w=1000&q=85",
    description: "A distinctive silhouette for your space.",
  },
  {
    id: 6,
    name: "Modern Console Table",
    category: "Tables",
    price: 36500,
    oldPrice: null,
    badge: "DESIGN PICK",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85",
    description: "Functional design with a refined finish.",
  },
{
    id: 7,
    name: "The Modern Media Console",
    category: "TV Stands",
    price: 28500,
    oldPrice: null,
    badge: "NEW ARRIVAL",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
    description: "A refined media centre for a beautifully organised living room.",
  },
  {
    id: 8,
    name: "The Haven Bed",
    category: "Beds",
    price: 68500,
    oldPrice: null,
    badge: "FEATURED",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85",
    description: "A calm, inviting centrepiece for your bedroom retreat.",
  },
  {
    id: 9,
    name: "The Signature Wardrobe",
    category: "Wardrobes",
    price: 55000,
    oldPrice: null,
    badge: "",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=85",
    description: "Practical storage with a clean, contemporary finish.",
  },
  {
    id: 10,
    name: "The Gather Dining Set",
    category: "Dining Furniture",
    price: 75000,
    oldPrice: null,
    badge: "DESIGN PICK",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85",
    description: "A welcoming dining centrepiece for everyday meals and gatherings.",
  },
  {
    id: 11,
    name: "The Executive Desk",
    category: "Office Furniture",
    price: 38500,
    oldPrice: null,
    badge: "NEW ARRIVAL",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=85",
    description: "A modern workspace designed for focus and productivity.",
  },
  {
    id: 12,
    name: "The Essential Storage Cabinet",
    category: "Storage & Cabinets",
    price: 32500,
    oldPrice: null,
    badge: "",
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=1000&q=85",
    description: "Versatile storage that keeps your space organised and uncluttered.",
  },
];

const collections = [
  {
    number: "01",
    title: "Living",
    subtitle: "Make yourself at home.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
    className: "collection-living",
    category: "Sofas",
  },
  {
    number: "02",
    title: "Bedroom",
    subtitle: "Your own kind of calm.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
    className: "collection-bedroom",
    category: "All",
  },
  {
    number: "03",
    title: "Dining",
    subtitle: "Bring everyone together.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    className: "collection-dining",
    category: "Tables",
  },
];

const benefits = [
  {
    number: "01",
    title: "Curated Design",
    description:
      "Considered furniture for spaces that reflect your personality.",
  },
  {
    number: "02",
    title: "Quality First",
    description:
      "Explore distinctive pieces selected with comfort and function in mind.",
  },
  {
    number: "03",
    title: "Reliable Delivery",
    description:
      "Get in touch with our team to discuss delivery arrangements.",
  },
  {
    number: "04",
    title: "Personal Support",
    description:
      "We are here to help you find the right pieces for your home.",
  },
];

const formatPrice = (price: number) =>
  `KSh ${price.toLocaleString("en-KE")}`;

function WhatsAppLink({
  productName,
  className = "",
  children,
}: {
  productName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const message = productName
    ? `Hello Smart Furnitures, I would like to enquire about ${productName}.`
    : "Hello Smart Furnitures, I would like to enquire about your furniture collection.";

  const href = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        productName
          ? `Enquire about ${productName} on WhatsApp`
          : "Enquire about Smart Furnitures"
      }
    >
      {children}
    </a>
  );
}

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a
      href="#home"
      className={`brand${footer ? " brand-footer" : ""}`}
      aria-label="Smart Furnitures home"
    >
      <span className="brand-symbol">S.</span>
      <span className="brand-copy">
        <strong>SMART</strong>
        <span>FURNITURES</span>
      </span>
    </a>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span className="eyebrow-line" />
      <span>{children}</span>
    </div>
  );
}


function CustomFurnitureRequest() {
  const [furnitureType, setFurnitureType] = useState("Sofa");
  const [customerName, setCustomerName] = useState("");
  const [budget, setBudget] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [details, setDetails] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = [
      "Hello Smart Furnitures!",
      "",
      "I would like to request custom furniture.",
      "",
      `Name: ${customerName}`,
      `Furniture type: ${furnitureType}`,
      `Budget: ${budget ? `KSh ${budget}` : "Not specified"}`,
      `Dimensions: ${dimensions || "Not specified"}`,
      `Additional details: ${details || "Not specified"}`,
      "",
      "Please contact me to discuss my request."
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="custom-request-section section-pad" id="custom-order">
      <div className="custom-request-intro">
        <Eyebrow>MADE AROUND YOU</Eyebrow>

        <h2>
          Your idea.
          <br />
          <span>Our craftsmanship.</span>
        </h2>

        <p>
          Looking for a particular size, finish or design?
          Tell us what you have in mind and send your request
          directly to our team on WhatsApp.
        </p>

        <div className="custom-request-note">
          <span className="custom-request-note-line" />
          <span>LET&apos;S CREATE SOMETHING THAT FEELS LIKE YOU.</span>
        </div>
      </div>

      <form className="custom-request-form" onSubmit={handleSubmit}>
        <div className="custom-form-heading">
          <span>01 / YOUR PROJECT</span>
          <span>PERSONAL ENQUIRY</span>
        </div>

        <label htmlFor="custom-customer-name">
          YOUR NAME
          <input
            id="custom-customer-name"
            name="customerName"
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            required
          />
        </label>

        <label htmlFor="custom-furniture-type">
          WHAT WOULD YOU LIKE?
          <select
            id="custom-furniture-type"
            name="furnitureType"
            value={furnitureType}
            onChange={(event) => setFurnitureType(event.target.value)}
          >
            <option value="Sofa">Sofa / Couch</option>
            <option value="Bed">Bed / Bedroom furniture</option>
            <option value="Dining table">Dining table</option>
            <option value="Wardrobe">Wardrobe</option>
            <option value="TV stand">TV stand / Cabinet</option>
            <option value="Coffee table">Coffee table</option>
            <option value="Office furniture">Office furniture</option>
            <option value="Other custom furniture">Other custom furniture</option>
          </select>
        </label>

        <div className="custom-form-row">
          <label htmlFor="custom-budget">
            ESTIMATED BUDGET (KSH)
            <input
              id="custom-budget"
              name="budget"
              type="number"
              min="0"
              step="100"
              placeholder="e.g. 35000"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </label>

          <label htmlFor="custom-dimensions">
            SIZE / DIMENSIONS
            <input
              id="custom-dimensions"
              name="dimensions"
              type="text"
              placeholder="e.g. 6 by 6 feet"
              value={dimensions}
              onChange={(event) => setDimensions(event.target.value)}
            />
          </label>
        </div>

        <label htmlFor="custom-details">
          TELL US MORE ABOUT YOUR IDEA
          <textarea
            id="custom-details"
            name="details"
            rows={4}
            placeholder="Describe your preferred colour, material, design or anything else we should know..."
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
        </label>

        <button className="custom-request-submit" type="submit">
          <FaWhatsapp size={19} aria-hidden="true" />
          SEND REQUEST ON WHATSAPP
          <ArrowUpRight size={17} aria-hidden="true" />
        </button>

        <p className="custom-form-disclaimer">
          Your request will open WhatsApp with your details ready to send.
        </p>
      </form>
    </section>
  );
}


export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    "All",
    "Sofas",
    "Chairs",
    "Tables",
    "TV Stands",
    "Beds",
    "Wardrobes",
    "Dining Furniture",
    "Office Furniture",
    "Storage & Cabinets",
  ];

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (product) => product.category === activeCategory,
        );

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <main className="luxury-site" id="home">
      {/* ANNOUNCEMENT */}
      <div className="announcement-bar">
        <p>THOUGHTFULLY DESIGNED FURNITURE. TIMELESS BY NATURE.</p>
        <span>SMART FURNITURES</span>
      </div>

      {/* HEADER */}
      <header className="site-header">
        <div className="header-inner">
          <Brand />

          <nav className="desktop-nav" aria-label="Main navigation">
            <a className="nav-link active" href="#home">Home</a>
            <a className="nav-link" href="#shop">Shop</a>
            <a className="nav-link" href="#collections">Collections</a>
            <a className="nav-link" href="#story">Our Story</a>
            <a className="nav-link" href="#contact">Contact</a>
          </nav>

          <a href="#shop" className="header-cta">
            EXPLORE SHOP <ArrowUpRight size={15} strokeWidth={1.5} />
          </a>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a href="#home" onClick={closeMenu}>Home <ArrowUpRight size={16} /></a>
            <a href="#shop" onClick={closeMenu}>Shop <ArrowUpRight size={16} /></a>
            <a href="#collections" onClick={closeMenu}>Collections <ArrowUpRight size={16} /></a>
            <a href="#story" onClick={closeMenu}>Our Story <ArrowUpRight size={16} /></a>
            <a href="#contact" onClick={closeMenu}>Contact <ArrowUpRight size={16} /></a>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-copy">
          <Eyebrow>A DIFFERENT KIND OF FURNITURE STORE</Eyebrow>

          <h1 className="hero-title">
            Design
            <br />
            that <span>speaks.</span>
            <br />
            Silence
            <br />
            <span className="outline-text">that lasts.</span>
          </h1>

          <p className="hero-description">
            Furniture for the way you want to live.
            Thoughtful silhouettes, considered details,
            and spaces that feel unmistakably yours.
          </p>

          <div className="hero-actions">
            <a href="#shop" className="button button-light">
              EXPLORE THE COLLECTION
              <ArrowUpRight size={17} strokeWidth={1.5} />
            </a>
            <a href="#story" className="text-link">
              OUR PHILOSOPHY <ArrowDownRight size={16} />
            </a>
          </div>

          <div className="hero-proof">
            <div>
              <strong>01</strong>
              <span>CONSIDERED DESIGN</span>
            </div>
            <span className="proof-divider" />
            <div>
              <strong>02</strong>
              <span>MADE FOR LIVING</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=90"
              alt="Sophisticated contemporary living room with carefully arranged furniture"
              fetchPriority="high"
            />
            <div className="hero-image-shade" />

            <div className="hero-image-top">
              <span>THE ART OF LIVING</span>
              <span>NO. 001</span>
            </div>

            <div className="hero-image-bottom">
              <div>
                <span>THE SMART EDIT</span>
                <p>Form meets feeling.</p>
              </div>
              <span className="hero-image-index">01 / 03</span>
            </div>
          </div>

          <span className="hero-side-label">SMART FURNITURES · KENYA</span>

          <a href="#collections" className="hero-floating-card">
            <span className="floating-card-number">01</span>
            <span className="floating-card-copy">
              <span>THE NEW STANDARD</span>
              <strong>Everyday living.</strong>
            </span>
            <ArrowUpRight size={20} strokeWidth={1.5} />
          </a>
        </div>

        <a className="hero-scroll" href="#editorial">
          <span>SCROLL TO DISCOVER</span>
          <span className="scroll-line" />
        </a>

        <span className="hero-background-letter" aria-hidden="true">S</span>
      </section>

      {/* EDITORIAL MARQUEE */}
      <section className="editorial-strip" id="editorial" aria-label="Our design philosophy">
        <div className="editorial-strip-inner">
          <span>DESIGNED FOR LIVING</span>
          <span className="editorial-symbol">✳</span>
          <span>BUILT AROUND YOU</span>
          <span className="editorial-symbol">✳</span>
          <span>FORM MEETS FUNCTION</span>
          <span className="editorial-symbol">✳</span>
          <span>DESIGNED FOR LIVING</span>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-section section-pad">
        <div className="section-heading benefits-heading">
          <div>
            <Eyebrow>THE SMART DIFFERENCE</Eyebrow>
            <h2 className="section-title">
              More than furniture.
              <br />
              <span>A feeling.</span>
            </h2>
          </div>
          <p className="section-intro">
            Great spaces do more than look good.
            They change the way everyday life feels.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.number}>
              <span className="benefit-number">/ {benefit.number}</span>
              <span className="benefit-icon" aria-hidden="true">
                {benefit.number === "01" ? "◇" : null}
                {benefit.number === "02" ? "✳" : null}
                {benefit.number === "03" ? "↗" : null}
                {benefit.number === "04" ? "○" : null}
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
              <span className="benefit-rule" />
            </article>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="shop-section section-pad" id="shop">
        <div className="section-heading shop-heading">
          <div>
            <Eyebrow>THE SMART EDIT</Eyebrow>
            <h2 className="section-title">
              Pieces worth
              <br />
              <span>coming home to.</span>
            </h2>
          </div>
          <p className="section-intro">
            A considered collection of furniture
            for the spaces that matter most.
          </p>
        </div>

        <div className="product-toolbar">
          <div className="product-filters" aria-label="Filter products">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-button${activeCategory === category ? " selected" : ""}`}
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <span className="product-total">
            {String(filteredProducts.length).padStart(2, "0")} PIECES
          </span>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product, index) => (
            <article
              className="product-card"
              key={product.id}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="product-image-wrap">
                <img
                  className="product-image"
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                />

                {product.badge && (
                  <span className="product-badge">{product.badge}</span>
                )}

                <WhatsAppLink
                  productName={product.name}
                  className="product-quick-action"
                >
                  ENQUIRE ABOUT THIS PIECE
                  <ArrowUpRight size={16} />
                </WhatsAppLink>

                <span className="product-image-number">
                  {String(product.id).padStart(2, "0")}
                </span>
              </div>

              <div className="product-details">
                <div className="product-category-row">
                  <span className="product-category">{product.category}</span>
                  <span className="product-reference">
                    SM / {String(product.id).padStart(3, "0")}
                  </span>
                </div>

                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>

                <div className="product-price-row">
                  <div className="product-prices">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    {product.oldPrice && (
                      <span className="product-old-price">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>
                  <WhatsAppLink
                    productName={product.name}
                    className="product-arrow"
                    aria-label={`Enquire about ${product.name}`}
                  >
                    <ArrowUpRight size={20} strokeWidth={1.5} />
                  </WhatsAppLink>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="shop-bottom">
          <p>FIND YOUR PIECE. MAKE IT YOURS.</p>
          <WhatsAppLink className="button button-outline">
            ASK ABOUT OUR FULL RANGE
            <ArrowUpRight size={17} />
          </WhatsAppLink>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="collections-section section-pad" id="collections">
        <div className="section-heading collections-heading">
          <div>
            <Eyebrow>FIND YOUR SPACE</Eyebrow>
            <h2 className="section-title">
              Different rooms.
              <br />
              <span>One feeling.</span>
            </h2>
          </div>
          <p className="section-intro">
            Discover considered pieces for
            every corner of your home.
          </p>
        </div>

        <div className="collections-grid">
          {collections.map((collection) => (
            <a
              href="#shop"
              className={`collection-card ${collection.className}`}
              key={collection.number}
              onClick={() => setActiveCategory(collection.category)}
            >
              <img
                src={collection.image}
                alt={`${collection.title} furniture collection`}
                className="collection-image"
                loading="lazy"
              />
              <span className="collection-shade" />
              <span className="collection-number">/ {collection.number}</span>
              <div className="collection-caption">
                <div>
                  <span>{collection.subtitle}</span>
                  <h3>{collection.title}</h3>
                </div>
                <span className="collection-arrow">
                  <ArrowUpRight size={22} strokeWidth={1.5} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* STATEMENT */}
      <section className="statement-section">
        <span className="statement-mark" aria-hidden="true">“</span>
        <Eyebrow>A NOTE ON GOOD DESIGN</Eyebrow>
        <h2>
          Your home should
          <br />
          <span>feel like you.</span>
        </h2>
        <p>
          Not a showroom. Not a passing trend.
          A reflection of who you are and how you live.
          That is where good furniture begins.
        </p>
        <a href="#shop" className="statement-link">
          FIND YOUR SIGNATURE PIECE
          <ArrowUpRight size={17} />
        </a>
        <span className="statement-decoration" aria-hidden="true">S.</span>
      </section>

      {/* STORY */}
      <section className="story-section section-pad" id="story">
        <div className="story-visual">
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85"
            alt="A thoughtfully styled contemporary interior"
            loading="lazy"
          />
          <div className="story-image-caption">
            <span>SPACE TO BE YOURSELF.</span>
            <span>SMART FURNITURES</span>
          </div>
          <span className="story-image-index">S / 2021</span>
        </div>

        <div className="story-copy">
          <Eyebrow>OUR POINT OF VIEW</Eyebrow>
          <h2>
            Good spaces
            <br />
            start with
            <br />
            <span>good choices.</span>
          </h2>
          <p>
            Furniture is more than something that fills a room.
            It is where conversations happen, where you unwind,
            and where your everyday life takes shape.
          </p>
          <p>
            At Smart Furnitures, we want to help you discover
            pieces that bring comfort, character, and a sense
            of belonging into your space.
          </p>
          <a href="#shop" className="button button-light">
            EXPLORE OUR COLLECTION
            <ArrowUpRight size={17} />
          </a>
          <div className="story-signature">
            <span>S.</span>
            <p>SMART FURNITURES</p>
          </div>
        </div>
      </section>

      <CustomFurnitureRequest />

      {/* CONTACT CTA */}
      <section className="contact-section" id="contact">
        <div className="contact-topline">
          <span>HAVE A SPACE IN MIND?</span>
          <span>LET&apos;S TALK FURNITURE.</span>
        </div>

        <div className="contact-content">
          <Eyebrow>YOUR NEXT CHAPTER STARTS HERE</Eyebrow>
          <h2>
            Let&apos;s make
            <br />
            <span>room for better.</span>
          </h2>
          <p>
            Have a question about a piece or need help
            finding the right furniture? Start a conversation
            with our team.
          </p>
          <WhatsAppLink className="button button-light contact-button">
            START A CONVERSATION
            <ArrowUpRight size={17} />
          </WhatsAppLink>
        </div>

        <span className="contact-decoration" aria-hidden="true">S.</span>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-column">
            <Brand footer />
            <p>
              Furniture for the way
              <br />
              you want to live.
            </p>
            <span className="footer-tagline">GOOD DESIGN. BETTER LIVING.</span>

            <div className="footer-socials" aria-label="Connect with Smart Furnitures">
              <a
                href="https://wa.me/254790753642"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Smart Furnitures on WhatsApp"
                title="WhatsApp"
              >
                <FaWhatsapp size={20} aria-hidden="true" />
              </a>

              <a
                href="https://www.tiktok.com/@smartfurnitures?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Smart Furnitures on TikTok"
                title="TikTok"
              >
                <FaTiktok size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>EXPLORE</h3>
            <a href="#home">Home</a>
            <a href="#shop">Shop furniture</a>
            <a href="#collections">Collections</a>
            <a href="#story">Our story</a>
          </div>

          <div className="footer-column">
            <h3>NEED HELP?</h3>
            <a href="#contact">Contact us</a>
            <a href="#shop">Product enquiries</a>
            <a href="#contact">Customer support</a>
          </div>

          <div className="footer-column footer-contact">
            <h3>LET&apos;S CONNECT</h3>
            <p>
              Looking for something specific?
              Speak to our team about your furniture needs.
            </p>
            <WhatsAppLink className="footer-contact-link">
              START A CONVERSATION
              <ArrowRight size={15} />
            </WhatsAppLink>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SMART FURNITURES. ALL RIGHTS RESERVED.</p>
          <a href="#home">BACK TO TOP ↑</a>
          <span>DESIGNED FOR LIVING.</span>
        </div>
      </footer>

      {/* FLOATING ENQUIRY */}
      <WhatsAppLink className="floating-whatsapp">
        <span className="whatsapp-dot" />
        <span>LET&apos;S TALK</span>
        <ArrowUpRight size={17} />
      </WhatsAppLink>
    </main>
  );
}
