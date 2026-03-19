import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  LayoutDashboard, Users, Building2, Columns3, Settings, X, Phone,
  CalendarDays, FileText, Mail, Plus, ChevronDown, Search, Filter,
  CheckCircle2, Edit3, MoreHorizontal,
  ChevronLeft, ChevronRight, StickyNote, ListChecks,
  ExternalLink, ArrowUpDown, BarChart3,
  PanelLeftClose, PanelLeftOpen, Download, Check,
  ArrowUp, ArrowDown, Pencil
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   HUBSPOT SCHEMA — exact field types & enum options from your account
   ═══════════════════════════════════════════════════════════════════════════ */

const SCHEMA = {
  contacts: {
    asset_class: { type: "enumeration", label: "Asset Class", options: ["Residential - For Rent","Residential - For Sale","Retail","Office","Industrial/Storage","Hotel","Healthcare/Senior","Land","Datacenter","Other"] },
    capital_type: { type: "enumeration", label: "Capital Type", options: ["Senior Debt","GP Equity","LP - Large","LP - Mid","Subordinated Debt/Pref Equity","Senior Debt - TX Banks","LP - Small"] },
    database_source: { type: "enumeration", label: "Database Source", options: ["TREP","KH"] },
    email_verification: { type: "enumeration", label: "Email Verification", options: ["valid","accept_all_unverifiable","invalid","unknown"] },
    family_office: { type: "enumeration", label: "Family Office", options: ["Family Office - Single","Family Office - Multi"] },
    indirect: { type: "enumeration", label: "Indirect", options: ["Pension Fund","Foundation","Endowment","RIA"] },
    institutional: { type: "enumeration", label: "Institutional", options: ["Fund Manager/Allocator","Sovereign Wealth","Life Company"] },
    investment_strategy: { type: "enumeration", label: "Investment Strategy", options: ["Development","Acquisition"] },
    region: { type: "enumeration", label: "Region", options: ["Mid-West","Northeast","Southeast","Southwest","West","International"] },
    relationship: { type: "enumeration", label: "Relationship", options: ["J - No Relationship","A - Very Well","B - Warm","H - Call","X - Going Concern","Y - Lender","W - Sponsor","Z - Existing"] },
    relationship_strength: { type: "enumeration", label: "Relationship Strength", options: ["Weak","Moderate","Strong"] },
    retail: { type: "enumeration", label: "Retail", options: ["HNW","Emerging","HNW (TX)","UHNW"] },
    ownership: { type: "enumeration", label: "Ownership", options: ["Direct Owner"] },
    hs_lead_status: { type: "enumeration", label: "Lead Status", options: ["Need to Call","Left VM","Sent Email","Had Call","Tag to Deal","Hold off for now"] },
    trep_capital_type__prior_outreach: { type: "enumeration", label: "TREP Capital Type, Prior Outreach", options: ["Programmatic Equity - TLHC IRF Income","Equity - Daytona","Equity - Healthcare","Equity - Wood River Valley Syndication","Transaction Prospects - Mountain West","Equity - TPP","Debt - Healthcare","Debt - Mountain West Banks","Debt - PAM Aiken"] },
    trep_deal__prior_outreach: { type: "enumeration", label: "TREP Deal, Prior Outreach", options: ["Tomoka Gate","Carpenter","Rivana","Magdalena","NNN Medical","MicroBay","1600 SoCO","SoCo Hotel","Clear Sky","PAM Aiken","PAM Dover","TMC Pref","Rivana Recap","SunGate Recap"] },
    preferred_asset_classes: { type: "enumeration", label: "Preferred Asset Classes", options: ["Residential","Commercial","Industrial","Retail"] },
    preferred_geographies: { type: "enumeration", label: "Preferred Geographies", options: ["North America","Europe","Asia","South America"] },
    next_steps: { type: "string", label: "Next Steps" },
    message: { type: "string", label: "Message" },
    last_interaction_date: { type: "datetime", label: "Last Interaction Date" },
    name: { type: "string", label: "Name" },
    company: { type: "string", label: "Company Name" },
    email: { type: "string", label: "Email" },
    phone: { type: "string", label: "Phone Number" },
    contactOwner: { type: "enumeration", label: "Contact Owner", options: ["Kyle Henrickson","Harsh Sharma","Bill Roesch","Henry Wee","No owner"] },
    lastActivityDate: { type: "datetime", label: "Last Activity Date" },
  },
  deals: {
    asset_class: { type: "enumeration", label: "Asset Class", options: ["Residential - For Rent","Residential - For Sale","Retail","Office","Industrial/Storage","Hotel","Healthcare/Senior","Land","Datacenter","Other"] },
    dealstage: { type: "enumeration", label: "Deal Stage", options: ["Overviews","Deal Review","LOI Sent","Sourcing","Closed","On Hold","Pass"] },
    due_diligence_status: { type: "enumeration", label: "Due Diligence Status", options: ["Not started","In progress","Completed"] },
    location: { type: "string", label: "Location" },
    amount: { type: "number", label: "Amount" },
    expected_investment_amount: { type: "number", label: "Expected Investment Amount" },
    expected_close_date: { type: "date", label: "Expected Close Date" },
    dealname: { type: "string", label: "Deal Name" },
    hubspot_owner_id: { type: "enumeration", label: "Deal Owner", options: ["Kyle Henrickson","Harsh Sharma","Bill Roesch","Henry Wee"] },
  },
  companies: {
    asset_class: { type: "enumeration", label: "Asset Class", options: ["Residential - For Rent","Residential - For Sale","Retail","Office","Industrial/Storage","Hotel","Healthcare/Senior","Land","Datacenter","Other"] },
    fund_type: { type: "enumeration", label: "Fund Type", options: ["Private Equity","Hedge Fund","Real Estate Investment Trust","Family Office"] },
    preferred_capital_types: { type: "enumeration", label: "Preferred Capital Types", options: ["Debt","Equity","Mezzanine"] },
    typical_check_size: { type: "number", label: "Typical Check Size" },
    last_preference_update_date: { type: "datetime", label: "Last Preference Update Date" },
    industry: { type: "enumeration", label: "Industry", options: ["Capital Markets","Commercial Real Estate","Financial Services","Investment Banking","Investment Management","Real Estate","Venture Capital & Private Equity"] },
  },
};

const ALL_CONTACT_COLUMNS = [
  { key: "name", label: "NAME", default: true, locked: true, schemaKey: "name" },
  { key: "company", label: "COMPANY NAME", default: true, schemaKey: "company" },
  { key: "email", label: "EMAIL", default: true, schemaKey: "email" },
  { key: "emailVerification", label: "EMAIL VERIFICATION", default: true, schemaKey: "email_verification" },
  { key: "phone", label: "PHONE NUMBER", default: true, schemaKey: "phone" },
  { key: "contactOwner", label: "CONTACT OWNER", default: true, schemaKey: "contactOwner" },
  { key: "leadStatus", label: "LEAD STATUS", default: true, schemaKey: "hs_lead_status" },
  { key: "investmentStrategy", label: "INVESTMENT STRATEGY", default: true, schemaKey: "investment_strategy" },
  { key: "capitalType", label: "CAPITAL TYPE", default: true, schemaKey: "capital_type" },
  { key: "nextSteps", label: "NEXT STEPS", default: false, schemaKey: "next_steps" },
  { key: "lastActivityDate", label: "LAST ACTIVITY DATE", default: false, schemaKey: "lastActivityDate" },
  { key: "dbSource", label: "DATABASE SOURCE", default: false, schemaKey: "database_source" },
  { key: "relationship", label: "RELATIONSHIP", default: false, schemaKey: "relationship" },
  { key: "relationshipStrength", label: "RELATIONSHIP STRENGTH", default: false, schemaKey: "relationship_strength" },
  { key: "region", label: "REGION", default: false, schemaKey: "region" },
  { key: "assetClass", label: "ASSET CLASS", default: false, schemaKey: "asset_class" },
  { key: "institutional", label: "INSTITUTIONAL", default: false, schemaKey: "institutional" },
  { key: "familyOffice", label: "FAMILY OFFICE", default: false, schemaKey: "family_office" },
  { key: "retail", label: "RETAIL", default: false, schemaKey: "retail" },
  { key: "indirect", label: "INDIRECT", default: false, schemaKey: "indirect" },
  { key: "ownership", label: "OWNERSHIP", default: false, schemaKey: "ownership" },
  { key: "trepCapitalType", label: "TREP CAPITAL TYPE, PRIOR OUTREACH", default: false, schemaKey: "trep_capital_type__prior_outreach" },
  { key: "trepDealPriorOutreach", label: "TREP DEAL, PRIOR OUTREACH", default: false, schemaKey: "trep_deal__prior_outreach" },
  { key: "message", label: "MESSAGE", default: false, schemaKey: "message" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   DUMMY DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const USERS_DATA = [
  { id: "u1", name: "Kyle Henrickson", role: "Super Admin", initials: "KH" },
  { id: "u2", name: "Harsh Sharma", role: "Manager", initials: "HS" },
  { id: "u3", name: "Emily Park", role: "Associate", initials: "EP" },
];

const COMPANIES_DATA = [
  { id: "co1", name: "CenterSquare Investment Management", domain: "centersquare.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co2", name: "Tramview Capital Management", domain: "tramview.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co3", name: "Declaration Partners", domain: "declarationpartner.com", fundType: "Private Equity", typicalCheckSize: 5000000, preferredCapitalTypes: "Equity", assetClass: "" },
  { id: "co4", name: "Argosy Real Estate Partners", domain: "argosyrep.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co5", name: "Gtis Partners", domain: "gtispartners.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co6", name: "Hig Realty Partners", domain: "higrealty.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co7", name: "Long Wharf Capital", domain: "longwharf.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co8", name: "Jefferson River Capital", domain: "jrivercapital.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co13", name: "Walton Street Capital", domain: "waltonst.com", fundType: "Private Equity", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co14", name: "Quannah Partners", domain: "quannahpa.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co16", name: "Blue Vista Capital Management", domain: "bluevistallc.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co18", name: "LLJ Ventures", domain: "lljventures.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co19", name: "Allstate", domain: "allstate.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co21", name: "Appian Capital", domain: "appiancapital.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co22", name: "Promus Capital Management", domain: "promusca.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co23", name: "Andell Holdings", domain: "andellinc.com", fundType: "Family Office", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co24", name: "Ascentris", domain: "ascentris.co", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co32", name: "Schmier Property Group", domain: "schmierpropertygro.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co33", name: "IHP Inc", domain: "ihpinc.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
  { id: "co15", name: "Artemis Real Estate Partners", domain: "artemisrep.co", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "" },
];

const initialContacts = [
  { id:"c1",name:"Beau Vande Walle",company:"Tramview Capital Management",companyId:"co2",email:"bvandewalle@tramview.co",emailVerification:"unknown",phone:"(920) 680-6427",contactOwner:"Kyle Henrickson",leadStatus:"Need to Call",investmentStrategy:"",capitalType:"LP - Small, LP - Mid",dbSource:"KH",relationship:"A - Very Well",relationshipStrength:"Strong",region:"Southwest, West",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"Tomoka Gate",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c2",name:"George Roux",company:"Declaration Partners",companyId:"co3",email:"groux@declarationpartner.com",emailVerification:"unknown",phone:"",contactOwner:"No owner",leadStatus:"",investmentStrategy:"",capitalType:"GP Equity, LP - Large",dbSource:"KH",relationship:"H - Call",relationshipStrength:"",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"Tomoka Gate",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c3",name:"Rick Firmine",company:"Argosy Real Estate Partners",companyId:"co4",email:"rfirmine@argosyrep.com",emailVerification:"valid",phone:"",contactOwner:"Kyle Henrickson",leadStatus:"Need to Call",investmentStrategy:"",capitalType:"LP - Mid",dbSource:"KH",relationship:"A - Very Well",relationshipStrength:"Moderate",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"Tomoka Gate, Carpenter",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c5",name:"Theodore Karatz",company:"Gtis Partners",companyId:"co5",email:"tkaratz@gtispartners.com",emailVerification:"valid",phone:"(310) 422-8686",contactOwner:"Kyle Henrickson",leadStatus:"Need to Call",investmentStrategy:"",capitalType:"",dbSource:"KH",relationship:"A - Very Well",relationshipStrength:"",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"Tomoka Gate",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c7",name:"Adam Belfer",company:"Hig Realty Partners",companyId:"co6",email:"abelfer@higrealty.com",emailVerification:"valid",phone:"",contactOwner:"Harsh Sharma",leadStatus:"",investmentStrategy:"",capitalType:"LP - Large, Subordinated Debt/Pref Equity",dbSource:"KH",relationship:"A - Very Well",relationshipStrength:"Strong",region:"Mid-West, Southeast",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"Tomoka Gate",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c8",name:"Solon Aposhian",company:"Long Wharf Capital",companyId:"co7",email:"solon.aposhian@longwharf.com",emailVerification:"unknown",phone:"(617) 250-7258",contactOwner:"No owner",leadStatus:"",investmentStrategy:"",capitalType:"",dbSource:"TREP",relationship:"",relationshipStrength:"",region:"",assetClass:"",ownership:"",institutional:"Fund Manager/Allocator",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"1600 SoCO, TMC Pref, SunGate Recap",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c9",name:"Drew Rifkin",company:"Jefferson River Capital",companyId:"co8",email:"drifkin@jrivercapital.com",emailVerification:"unknown",phone:"212-339-2006",contactOwner:"No owner",leadStatus:"",investmentStrategy:"",capitalType:"",dbSource:"TREP",relationship:"",relationshipStrength:"",region:"",assetClass:"",ownership:"",institutional:"Fund Manager/Allocator",familyOffice:"",retail:"HNW, Emerging",indirect:"",trepCapitalType:"Equity - TPP",trepDealPriorOutreach:"1600 SoCO, TMC Pref",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c10",name:"Jeff Reder",company:"CenterSquare Investment Management",companyId:"co1",email:"jreder@centersquare.com",emailVerification:"unknown",phone:"(949) 444-6119",contactOwner:"Kyle Henrickson",leadStatus:"Need to Call",investmentStrategy:"",capitalType:"LP - Large",dbSource:"KH",relationship:"A - Very Well",relationshipStrength:"Strong",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"NNN Medical",nextSteps:"",lastActivityDate:"Mar 17, 2026",message:"" },
  { id:"c11",name:"Robert Bloom",company:"Walton Street Capital",companyId:"co13",email:"bloomr@waltonst.com",emailVerification:"unknown",phone:"(312) 915-2803",contactOwner:"Kyle Henrickson",leadStatus:"Need to Call",investmentStrategy:"",capitalType:"",dbSource:"KH",relationship:"",relationshipStrength:"",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c15",name:"Tommy Norgaard",company:"LLJ Ventures",companyId:"co18",email:"tnorgaard@lljventures.com",emailVerification:"invalid",phone:"(619) 808-6476",contactOwner:"Kyle Henrickson",leadStatus:"Had Call",investmentStrategy:"",capitalType:"LP - Small",dbSource:"KH",relationship:"",relationshipStrength:"Weak",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"",nextSteps:"2 records",lastActivityDate:"Mar 9, 2026",message:"" },
  { id:"c16",name:"Chris Winnen",company:"Allstate",companyId:"co19",email:"chris.winnen@allstate.com",emailVerification:"accept_all_unverifiable",phone:"(773) 551-6262",contactOwner:"Kyle Henrickson",leadStatus:"Need to Call",investmentStrategy:"",capitalType:"LP - Large",dbSource:"KH",relationship:"",relationshipStrength:"",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c17",name:"Ryan McGrath",company:"Andell Holdings",companyId:"co23",email:"rmcgrath@andellinc.com",emailVerification:"valid",phone:"(310) 210-8359",contactOwner:"Kyle Henrickson",leadStatus:"Had Call",investmentStrategy:"",capitalType:"LP - Small",dbSource:"KH",relationship:"",relationshipStrength:"Moderate",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"",nextSteps:"KH spoke with Ryan. Just ...",lastActivityDate:"Mar 6, 2026",message:"" },
  { id:"c18",name:"Michael Tresley",company:"Promus Capital Management",companyId:"co22",email:"michael.tresley@promusca.com",emailVerification:"valid",phone:"(847) 373-3173",contactOwner:"Kyle Henrickson",leadStatus:"Need to Call",investmentStrategy:"Development",capitalType:"LP - Small",dbSource:"KH",relationship:"",relationshipStrength:"",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c19",name:"Jonathan Lotter",company:"Appian Capital",companyId:"co21",email:"jlotter@appiancapital.com",emailVerification:"",phone:"(415) 999-1440",contactOwner:"",leadStatus:"",investmentStrategy:"",capitalType:"",dbSource:"TREP",relationship:"",relationshipStrength:"",region:"",assetClass:"",ownership:"",institutional:"Fund Manager/Allocator",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"",nextSteps:"",lastActivityDate:"",message:"" },
  { id:"c20",name:"Peter Savoie",company:"Ascentris",companyId:"co24",email:"peter.savoie@ascentris.co",emailVerification:"valid",phone:"(303) 882-5109",contactOwner:"Kyle Henrickson",leadStatus:"Need to Call",investmentStrategy:"",capitalType:"LP - Large, LP - Mid",dbSource:"KH",relationship:"",relationshipStrength:"",region:"",assetClass:"",ownership:"",institutional:"",familyOffice:"",retail:"",indirect:"",trepCapitalType:"",trepDealPriorOutreach:"",nextSteps:"Ascentris (3/4/2026) - Star...",lastActivityDate:"Mar 6, 2026",message:"" },
];

const DEALS = [
  { id:"d1",name:"Firm Overview",amount:null,closeDate:"05/31/2026",dealOwner:"Kyle Henrickson",createDate:"05/17/2026",stage:"Overviews",assetClass:"",location:"",dueDiligenceStatus:"Not started",expectedInvestmentAmount:null,contactIds:["c18","c19","c10"],attachments:["Timberline-Overview-031626.pdf"] },
  { id:"d2",name:"Verticals Overview",amount:null,closeDate:"05/17/2026",dealOwner:"Kyle Henrickson",createDate:"05/17/2026",stage:"Overviews",assetClass:"",location:"",dueDiligenceStatus:"",expectedInvestmentAmount:null,contactIds:["c10","c8"],attachments:[] },
  { id:"d3",name:"Plaza - Reno",amount:10000000,closeDate:"05/31/2026",dealOwner:"Kyle Henrickson",createDate:"05/17/2026",stage:"Deal Review",assetClass:"Retail",location:"Reno, NV",dueDiligenceStatus:"Not started",expectedInvestmentAmount:null,contactIds:["c11","c5"],attachments:[] },
  { id:"d4",name:"Embassy Suites - Austin",amount:8000000,closeDate:"05/17/2026",dealOwner:"Kyle Henrickson",createDate:"03/16/2026",stage:"Deal Review",assetClass:"Hotel",location:"Austin, TX",dueDiligenceStatus:"In progress",expectedInvestmentAmount:null,overdue:true,contactIds:["c16","c20","c18","c7","c15"],attachments:[] },
  { id:"d5",name:"Hotel Magdalena",amount:21000000,closeDate:"05/31/2026",dealOwner:"Kyle Henrickson",createDate:"03/17/2026",stage:"LOI Sent",assetClass:"Hotel",location:"Austin, TX",dueDiligenceStatus:"",expectedInvestmentAmount:null,contactIds:["c10","c11"],attachments:[] },
  { id:"d6",name:"Carpenter - Recap",amount:20000000,closeDate:"05/31/2026",dealOwner:"Kyle Henrickson",createDate:"03/17/2026",stage:"On Hold",assetClass:"Industrial/Storage",location:"Columbus, OH",dueDiligenceStatus:"Completed",expectedInvestmentAmount:null,contactIds:["c8","c9"],attachments:[] },
];

const PIPELINE_STAGES = SCHEMA.deals.dealstage.options;

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function Avatar({ name, size = "sm" }) {
  const s = size === "xs" ? "w-6 h-6 text-xs" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const colors = ["bg-teal-100 text-teal-700","bg-blue-100 text-blue-700","bg-purple-100 text-purple-700","bg-orange-100 text-orange-700","bg-pink-100 text-pink-700","bg-indigo-100 text-indigo-700"];
  const initials = name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"?";
  return <div className={`${s} rounded-full ${colors[(name?.charCodeAt(0)||0)%colors.length]} flex items-center justify-center font-semibold shrink-0`}>{initials}</div>;
}

function Badge({ children, variant = "default" }) {
  const st = { default:"bg-gray-100 text-gray-600", teal:"bg-teal-50 text-teal-700 border border-teal-200", red:"bg-red-50 text-red-600 border border-red-200" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${st[variant]}`}>{children}</span>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/40" onClick={onClose}/><div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"><div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0"><h3 className="text-base font-bold text-gray-900">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18}/></button></div><div className="flex-1 overflow-y-auto p-5">{children}</div></div></div>);
}

function DropdownFilter({ label, options, value, onChange, isOpen, onToggle }) {
  const ref = useRef(null);
  useEffect(() => { if (!isOpen) return; const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onToggle(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); }, [isOpen]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>onToggle(!isOpen)} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors ${value!=="All"?"bg-teal-50 border-teal-300 text-teal-700":"bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
        {label}{value!=="All"&&` (1)`} <ChevronDown size={12}/>
        {value!=="All"&&<span onClick={(e)=>{e.stopPropagation();onChange("All");}} className="ml-0.5 hover:text-red-500"><X size={12}/></span>}
      </button>
      {isOpen&&(<div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 py-1 max-h-60 overflow-y-auto">{options.map(o=><button key={o} onClick={()=>{onChange(o);onToggle(false);}} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${value===o?"bg-teal-50 text-teal-700 font-medium":"text-gray-700"}`}>{value===o&&<Check size={14}/>}{o}</button>)}</div>)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCHEMA-AWARE INLINE EDITABLE CELL
   ═══════════════════════════════════════════════════════════════════════════ */

function EditableCell({ value, onSave, schemaKey, objectType = "contacts" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  const schemaDef = SCHEMA[objectType]?.[schemaKey];
  const fieldType = schemaDef?.type || "string";
  const options = schemaDef?.options || [];

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (!editing) {
    return (
      <div className="group/cell flex items-center gap-1 min-h-7 cursor-text" onClick={()=>setEditing(true)}>
        <span className="text-sm text-gray-700 truncate">{value || <span className="text-gray-400">--</span>}</span>
        <Pencil size={10} className="text-gray-300 opacity-0 group-hover/cell:opacity-100 shrink-0"/>
      </div>
    );
  }

  if (fieldType === "enumeration") {
    return (
      <select value={draft} onChange={(e)=>{onSave(e.target.value);setEditing(false);}} onBlur={cancel} ref={inputRef} className="text-sm border border-teal-400 rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white">
        <option value="">--</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (fieldType === "number") {
    return <input ref={inputRef} type="number" value={draft} onChange={(e)=>setDraft(e.target.value)} onBlur={commit} onKeyDown={(e)=>{if(e.key==="Enter")commit();if(e.key==="Escape")cancel();}} className="text-sm border border-teal-400 rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-teal-500"/>;
  }

  if (fieldType === "date" || fieldType === "datetime") {
    return <input ref={inputRef} type="date" value={draft} onChange={(e)=>setDraft(e.target.value)} onBlur={commit} onKeyDown={(e)=>{if(e.key==="Enter")commit();if(e.key==="Escape")cancel();}} className="text-sm border border-teal-400 rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-teal-500"/>;
  }

  // Default: string
  return <input ref={inputRef} value={draft} onChange={(e)=>setDraft(e.target.value)} onBlur={commit} onKeyDown={(e)=>{if(e.key==="Enter")commit();if(e.key==="Escape")cancel();}} className="text-sm border border-teal-400 rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-teal-500"/>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════════════════ */

function Sidebar({ activeView, setActiveView, user, collapsed, setCollapsed }) {
  const items = [
    { id:"dashboard",icon:LayoutDashboard,label:"Dashboard" },
    { id:"contacts",icon:Users,label:"Contacts" },
    { id:"companies",icon:Building2,label:"Companies" },
    { id:"deals",icon:Columns3,label:"Deals" },
    ...(user.role==="Super Admin"?[{ id:"settings",icon:Settings,label:"Settings" }]:[]),
  ];
  return (
    <div style={{ width:collapsed?52:200, backgroundColor:"#1a1a2e", transition:"width 0.2s" }} className="flex flex-col h-full shrink-0">
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.12)" }} className="flex items-center justify-between px-2 py-3">
        <div className="flex items-center gap-2 min-w-0"><div style={{ backgroundColor:"#ff5c35",width:28,height:28,borderRadius:6 }} className="flex items-center justify-center shrink-0"><Building2 size={14} color="#fff"/></div>{!collapsed&&<span style={{ color:"#fff",fontSize:14,fontWeight:600 }} className="truncate">Timberline</span>}</div>
        <button onClick={()=>setCollapsed(!collapsed)} style={{ color:"#9ca3af" }} className="p-0.5 shrink-0 hover:opacity-80">{collapsed?<PanelLeftOpen size={16}/>:<PanelLeftClose size={16}/>}</button>
      </div>
      <nav className="flex-1 flex flex-col gap-1 py-3 px-2">
        {items.map(item=>{const Icon=item.icon;const active=activeView===item.id;return(
          <button key={item.id} onClick={()=>setActiveView(item.id)} title={collapsed?item.label:undefined}
            style={{ display:"flex",alignItems:"center",gap:10,borderRadius:8,padding:collapsed?0:"8px 12px",width:collapsed?40:"100%",height:collapsed?40:"auto",justifyContent:collapsed?"center":"flex-start",backgroundColor:active?"rgba(255,255,255,0.15)":"transparent",color:active?"#fff":"#94a3b8",transition:"background 0.15s" }}
            onMouseEnter={e=>{if(!active){e.currentTarget.style.backgroundColor="rgba(255,255,255,0.08)";e.currentTarget.style.color="#e2e8f0";}}}
            onMouseLeave={e=>{if(!active){e.currentTarget.style.backgroundColor="transparent";e.currentTarget.style.color="#94a3b8";}}}
          ><Icon size={18} strokeWidth={1.5} className="shrink-0"/>{!collapsed&&<span style={{fontSize:13}} className="truncate">{item.label}</span>}</button>
        );})}
      </nav>
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.12)",padding:8 }} className={collapsed?"flex justify-center":""}>
        <div className={`flex items-center gap-2 ${collapsed?"":"px-2 py-1"}`} title={`${user.name}\n${user.role}`}>
          <div style={{ width:28,height:28,borderRadius:"50%",backgroundColor:"#f97316",color:"#fff",fontSize:10,fontWeight:700 }} className="flex items-center justify-center shrink-0">{user.initials}</div>
          {!collapsed&&<div className="min-w-0"><div style={{ fontSize:12,color:"#e2e8f0",fontWeight:500 }} className="truncate">{user.name}</div><div style={{ fontSize:10,color:"#64748b" }} className="truncate">{user.role}</div></div>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   OBJECT SWITCHER
   ═══════════════════════════════════════════════════════════════════════════ */

function ObjectSwitcher({ activeView, setActiveView }) {
  const objects = [{ id:"dashboard",label:"Dashboard",icon:LayoutDashboard },{ id:"contacts",label:"Contacts",icon:Users },{ id:"companies",label:"Companies",icon:Building2 },{ id:"deals",label:"Deals",icon:Columns3 }];
  return (
    <div style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 16px",backgroundColor:"#33475b" }} className="shrink-0">
      {objects.map(o=>{const Icon=o.icon;const active=activeView===o.id;return(
        <button key={o.id} onClick={()=>setActiveView(o.id)} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:4,fontSize:12,fontWeight:500,backgroundColor:active?"rgba(255,255,255,0.2)":"transparent",color:active?"#fff":"#b0bec5" }}
          onMouseEnter={e=>{if(!active)e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)";}}
          onMouseLeave={e=>{if(!active)e.currentTarget.style.backgroundColor="transparent";}}
        ><Icon size={13}/>{o.label}</button>
      );})}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */

function DashboardView() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Reports and analytics will appear here.</p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ l:"Total Contacts",v:initialContacts.length },{ l:"Active Deals",v:DEALS.length },{ l:"Companies",v:COMPANIES_DATA.length }].map(s=><div key={s.l} className="bg-white border border-gray-200 rounded-lg p-5 text-center"><div className="text-3xl font-bold text-gray-900">{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>)}
      </div>
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
        <BarChart3 size={40} className="mx-auto text-gray-300 mb-3"/>
        <div className="text-sm text-gray-500 font-medium">Add your first report</div>
        <button className="mt-4 px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">+ Add Report</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTACTS VIEW — schema-aware inline editing, filters, sort, columns, export
   ═══════════════════════════════════════════════════════════════════════════ */

function ContactsView({ contacts, updateContact, onSelectContact, onSelectCompany }) {
  const [listViews,setListViews]=useState([
    { id:"all",label:"All Contacts",filter:()=>true,columns:ALL_CONTACT_COLUMNS.filter(c=>c.default).map(c=>c.key) },
    { id:"kh",label:"KH List",filter:c=>c.contactOwner==="Kyle Henrickson",columns:["name","company","email","phone","leadStatus","capitalType","investmentStrategy","nextSteps"] },
  ]);
  const [activeListId,setActiveListId]=useState("all");
  const activeList=listViews.find(v=>v.id===activeListId)||listViews[0];
  const [openFilter,setOpenFilter]=useState(null);
  const [filters,setFilters]=useState({ contactOwner:"All",leadStatus:"All" });
  const [searchTerm,setSearchTerm]=useState("");
  const [sortCol,setSortCol]=useState(null);
  const [sortDir,setSortDir]=useState("asc");
  const [showColModal,setShowColModal]=useState(false);
  const [tempColumns,setTempColumns]=useState([]);
  const [showNewList,setShowNewList]=useState(false);
  const [newListName,setNewListName]=useState("");
  const [showSortModal,setShowSortModal]=useState(false);
  const [page,setPage]=useState(1);
  const perPage=50;
  const activeFilterCount=Object.values(filters).filter(v=>v!=="All").length;

  const filtered=useMemo(()=>{
    let data=contacts.filter(activeList.filter);
    if(filters.contactOwner!=="All")data=data.filter(c=>c.contactOwner===filters.contactOwner);
    if(filters.leadStatus!=="All")data=data.filter(c=>c.leadStatus===filters.leadStatus);
    if(searchTerm)data=data.filter(c=>c.name.toLowerCase().includes(searchTerm.toLowerCase())||c.company.toLowerCase().includes(searchTerm.toLowerCase())||c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    if(sortCol)data=[...data].sort((a,b)=>{const va=(a[sortCol]||"").toString().toLowerCase(),vb=(b[sortCol]||"").toString().toLowerCase();return sortDir==="asc"?va.localeCompare(vb):vb.localeCompare(va);});
    return data;
  },[contacts,activeList,filters,searchTerm,sortCol,sortDir]);

  const totalPages=Math.max(1,Math.ceil(filtered.length/perPage));
  const pageData=filtered.slice((page-1)*perPage,page*perPage);
  const visibleCols=ALL_CONTACT_COLUMNS.filter(c=>activeList.columns.includes(c.key));

  const handleExport=()=>{
    const header=visibleCols.map(c=>c.label).join(",");
    const rows=filtered.map(row=>visibleCols.map(c=>`"${(row[c.key]||"").toString().replace(/"/g,'""')}"`).join(","));
    const csv=[header,...rows].join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`contacts_export.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center px-4 pt-1">
          {listViews.map(v=><button key={v.id} onClick={()=>{setActiveListId(v.id);setPage(1);}} className={`px-3 py-2.5 text-sm font-medium border-b-2 ${activeListId===v.id?"border-teal-500 text-gray-900":"border-transparent text-gray-500 hover:text-gray-700"}`}>{v.label}<span className="ml-1 text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-semibold">{contacts.filter(v.filter).length}</span>{v.id!=="all"&&activeListId===v.id&&<span onClick={e=>{e.stopPropagation();setListViews(vs=>vs.filter(lv=>lv.id!==v.id));setActiveListId("all");}} className="ml-1.5 text-gray-400 hover:text-red-500"><X size={12} className="inline"/></span>}</button>)}
          <button onClick={()=>setShowNewList(true)} className="ml-1 p-1.5 text-gray-400 hover:text-gray-600 rounded" title="Create new list view"><Plus size={14}/></button>
          <div className="ml-auto flex items-center gap-2 pb-1">
            <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/><input value={searchTerm} onChange={e=>{setSearchTerm(e.target.value);setPage(1);}} placeholder="Search" className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded w-48 focus:outline-none focus:ring-1 focus:ring-teal-500"/></div>
            <button onClick={()=>{setTempColumns([...activeList.columns]);setShowColModal(true);}} className="text-sm text-gray-600 border border-gray-300 rounded px-2.5 py-1.5 hover:bg-gray-50">Edit columns</button>
            <button className={`text-sm border rounded px-2.5 py-1.5 flex items-center gap-1 ${activeFilterCount>0?"bg-teal-50 border-teal-300 text-teal-700":"border-gray-300 text-gray-600 hover:bg-gray-50"}`}><Filter size={13}/>Filters{activeFilterCount>0&&` (${activeFilterCount})`}</button>
            <button onClick={()=>setShowSortModal(true)} className={`text-sm border rounded px-2.5 py-1.5 flex items-center gap-1 ${sortCol?"bg-teal-50 border-teal-300 text-teal-700":"border-gray-300 text-gray-600 hover:bg-gray-50"}`}><ArrowUpDown size={13}/>Sort{sortCol&&" (1)"}</button>
            <button onClick={handleExport} className="text-sm text-gray-600 border border-gray-300 rounded px-2.5 py-1.5 hover:bg-gray-50 flex items-center gap-1"><Download size={13}/>Export</button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded">Add contacts +</button>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white flex-wrap shrink-0">
        <DropdownFilter label="Contact owner" options={["All",...SCHEMA.contacts.contactOwner.options]} value={filters.contactOwner} onChange={v=>{setFilters({...filters,contactOwner:v});setPage(1);}} isOpen={openFilter==="owner"} onToggle={v=>setOpenFilter(v?"owner":null)}/>
        <DropdownFilter label="Lead status" options={["All",...SCHEMA.contacts.hs_lead_status.options]} value={filters.leadStatus} onChange={v=>{setFilters({...filters,leadStatus:v});setPage(1);}} isOpen={openFilter==="lead"} onToggle={v=>setOpenFilter(v?"lead":null)}/>
        <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><Plus size={12}/>More</button>
        {activeFilterCount>0&&<button onClick={()=>setFilters({contactOwner:"All",leadStatus:"All"})} className="text-sm text-teal-600 hover:underline">Clear all</button>}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-max">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b border-gray-200">
              <th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300"/></th>
              {visibleCols.map(col=><th key={col.key} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-100" onClick={()=>{if(sortCol===col.key)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortCol(col.key);setSortDir("asc");}}}>
                <span className="flex items-center gap-1">{col.label}{sortCol===col.key?(sortDir==="asc"?<ArrowUp size={10}/>:<ArrowDown size={10}/>):<ArrowUpDown size={10} className="text-gray-300"/>}</span>
              </th>)}
            </tr>
          </thead>
          <tbody>
            {pageData.map(c=>(
              <tr key={c.id} className="border-b border-gray-100 hover:bg-blue-50 group">
                <td className="px-3 py-1.5"><input type="checkbox" className="rounded border-gray-300"/></td>
                {visibleCols.map(col=>(
                  <td key={col.key} className="px-3 py-1.5 max-w-xs">
                    {col.key==="name"?(
                      <div className="flex items-center gap-2"><Avatar name={c.name} size="xs"/><button onClick={()=>onSelectContact(c)} className="text-sm font-medium text-teal-600 hover:underline truncate">{c.name}</button></div>
                    ):col.key==="company"?(
                      <button onClick={()=>onSelectCompany(c.company)} className="text-sm text-teal-600 hover:underline truncate block max-w-xs">{c.company||"--"}</button>
                    ):col.key==="email"?(
                      c.email?<a href={`mailto:${c.email}`} className="text-sm text-teal-600 hover:underline truncate block max-w-xs" onClick={e=>e.stopPropagation()} title={`Email ${c.email}`}>{c.email}<ExternalLink size={9} className="inline ml-1"/></a>:<span className="text-sm text-gray-400">--</span>
                    ):col.key==="phone"?(
                      c.phone?<a href={`tel:${c.phone}`} className="text-sm text-teal-600 hover:underline" onClick={e=>e.stopPropagation()}>{c.phone}</a>:<span className="text-sm text-gray-400">--</span>
                    ):col.key==="contactOwner"?(
                      c.contactOwner&&c.contactOwner!=="No owner"?<div className="flex items-center gap-1"><Avatar name={c.contactOwner} size="xs"/><span className="text-sm text-gray-600 truncate max-w-xs">{c.contactOwner}</span></div>:<span className="text-sm text-gray-400">No owner</span>
                    ):col.key==="emailVerification"?(
                      <EditableCell value={c.emailVerification} onSave={v=>updateContact(c.id,"emailVerification",v)} schemaKey="email_verification"/>
                    ):(
                      <EditableCell value={c[col.key]} onSave={v=>updateContact(c.id,col.key,v)} schemaKey={col.schemaKey}/>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 py-2 border-t border-gray-200 bg-white shrink-0">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-30"><ChevronLeft size={14}/>Prev</button>
        {Array.from({length:Math.min(totalPages,11)},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} className={`w-7 h-7 rounded text-sm ${page===p?"bg-teal-600 text-white":"text-gray-500 hover:bg-gray-100"}`}>{p}</button>)}
        <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-30">Next<ChevronRight size={14}/></button>
      </div>

      {/* MODALS */}
      <Modal open={showColModal} onClose={()=>setShowColModal(false)} title="Edit Columns">
        <p className="text-xs text-gray-500 mb-3">Toggle visible columns for this list view.</p>
        <div className="space-y-1 max-h-96 overflow-y-auto">{ALL_CONTACT_COLUMNS.map(col=>{const active=tempColumns.includes(col.key);const sdef=SCHEMA.contacts[col.schemaKey];return(
          <label key={col.key} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 ${col.locked?"opacity-60":""}`}>
            <input type="checkbox" checked={active} disabled={col.locked} onChange={()=>{if(col.locked)return;setTempColumns(tc=>active?tc.filter(k=>k!==col.key):[...tc,col.key]);}} className="rounded border-gray-300 text-teal-600"/>
            <div><span className="text-sm text-gray-700">{col.label}</span>{sdef&&<span className="ml-2 text-xs text-gray-400">{sdef.type==="enumeration"?"Dropdown":sdef.type==="number"?"Number":sdef.type==="date"||sdef.type==="datetime"?"Date":"Text"}</span>}</div>
            {col.locked&&<span className="text-xs text-gray-400 ml-auto">Required</span>}
          </label>
        );})}</div>
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
          <button onClick={()=>setShowColModal(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded">Cancel</button>
          <button onClick={()=>{setListViews(vs=>vs.map(v=>v.id===activeListId?{...v,columns:tempColumns}:v));setShowColModal(false);}} className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded">Save columns</button>
        </div>
      </Modal>

      <Modal open={showSortModal} onClose={()=>setShowSortModal(false)} title="Sort Contacts">
        <div className="space-y-1">{visibleCols.map(col=><button key={col.key} onClick={()=>{setSortCol(col.key);setSortDir("asc");setShowSortModal(false);}} className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between hover:bg-gray-50 ${sortCol===col.key?"bg-teal-50 text-teal-700 font-medium":"text-gray-700"}`}>{col.label}{sortCol===col.key&&(sortDir==="asc"?<ArrowUp size={14}/>:<ArrowDown size={14}/>)}</button>)}</div>
        {sortCol&&<div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-200"><span className="text-sm text-gray-500">Direction:</span><button onClick={()=>setSortDir("asc")} className={`px-3 py-1 text-sm rounded ${sortDir==="asc"?"bg-teal-500 text-white":"bg-gray-100 text-gray-600"}`}>A→Z</button><button onClick={()=>setSortDir("desc")} className={`px-3 py-1 text-sm rounded ${sortDir==="desc"?"bg-teal-500 text-white":"bg-gray-100 text-gray-600"}`}>Z→A</button><button onClick={()=>{setSortCol(null);setShowSortModal(false);}} className="ml-auto text-sm text-red-500">Clear</button></div>}
      </Modal>

      <Modal open={showNewList} onClose={()=>setShowNewList(false)} title="Create New List View">
        <div><label className="text-xs text-gray-500 block mb-1">List view name</label><input value={newListName} onChange={e=>setNewListName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newListName.trim()){setListViews(vs=>[...vs,{id:"c_"+Date.now(),label:newListName.trim(),filter:()=>true,columns:ALL_CONTACT_COLUMNS.filter(c=>c.default).map(c=>c.key)}]);setActiveListId("c_"+Date.now());setNewListName("");setShowNewList(false);}}} placeholder="e.g. TREP Active Leads" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500" autoFocus/></div>
        <div className="flex justify-end gap-2 pt-3"><button onClick={()=>setShowNewList(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded">Cancel</button><button onClick={()=>{if(!newListName.trim())return;const nid="c_"+Date.now();setListViews(vs=>[...vs,{id:nid,label:newListName.trim(),filter:()=>true,columns:ALL_CONTACT_COLUMNS.filter(c=>c.default).map(c=>c.key)}]);setActiveListId(nid);setNewListName("");setShowNewList(false);}} disabled={!newListName.trim()} className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded disabled:opacity-40">Create</button></div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTACT DETAIL — schema-aware property editing in sidebar
   ═══════════════════════════════════════════════════════════════════════════ */

function ContactDetailView({ contact, onBack, contacts, updateContact }) {
  const c=contacts.find(ct=>ct.id===contact.id)||contact;
  const relatedDeals=DEALS.filter(d=>d.contactIds?.includes(c.id));
  const keyInfo = [
    ["Phone Number","phone"],["Contact Owner","contactOwner"],["Next Steps","nextSteps"],
    ["Lead Status","leadStatus","hs_lead_status"],["Database Source","dbSource","database_source"],
    ["Relationship","relationship","relationship"],["Relationship Strength","relationshipStrength","relationship_strength"],
    ["Region","region","region"],["Asset Class","assetClass","asset_class"],
    ["Capital Type","capitalType","capital_type"],["Investment Strategy","investmentStrategy","investment_strategy"],
    ["Institutional","institutional","institutional"],["Family Office","familyOffice","family_office"],
    ["Retail","retail","retail"],["Indirect","indirect","indirect"],["Ownership","ownership","ownership"],
    ["TREP Capital Type","trepCapitalType","trep_capital_type__prior_outreach"],
    ["TREP Deal, Prior Outreach","trepDealPriorOutreach","trep_deal__prior_outreach"],
    ["Message","message","message"],
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center px-4 py-2 border-b border-gray-200 shrink-0"><button onClick={onBack} className="text-sm text-teal-600 hover:underline flex items-center gap-1"><ChevronLeft size={14}/>Contacts</button></div>
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto shrink-0">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2"><Avatar name={c.name} size="lg"/><div><h2 className="text-xl font-bold text-gray-900">{c.name}</h2><div className="text-xs text-gray-500">{c.company}</div></div></div>
            <a href={`mailto:${c.email}`} className="text-sm text-teal-600 hover:underline block mt-1">{c.email}<ExternalLink size={10} className="inline ml-1"/></a>
            {c.phone&&<a href={`tel:${c.phone}`} className="text-sm text-teal-600 hover:underline block mt-0.5">{c.phone}</a>}
            <div className="flex items-center gap-2 mt-4">
              {[{icon:StickyNote,l:"Note"},{icon:Mail,l:"Email"},{icon:Phone,l:"Call"},{icon:ListChecks,l:"Task"},{icon:CalendarDays,l:"Meeting"},{icon:MoreHorizontal,l:"More"}].map(a=><button key={a.l} className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-teal-600"><div className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"><a.icon size={14}/></div><span className="text-xs">{a.l}</span></button>)}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Key information</h3>
            <div className="space-y-3">
              {keyInfo.map(([label,key,schemaKey])=>(
                <div key={label}>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="text-sm text-gray-900 mt-0.5">
                    {schemaKey ? <EditableCell value={c[key]} onSave={v=>updateContact(c.id,key,v)} schemaKey={schemaKey}/> : (c[key]||<span className="text-gray-400">--</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* CENTER */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-200 px-6 flex items-center shrink-0">
            {["Activity","Notes","Emails","Calls","Tasks","Meetings"].map(t=><button key={t} className="px-3 py-3 text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 first:border-teal-500 first:text-gray-900 first:font-medium">{t}</button>)}
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4"><div className="py-12 text-center text-sm text-gray-400">Activity timeline will display here.</div></div>
        </div>
        {/* RIGHT */}
        <div className="w-72 border-l border-gray-200 overflow-y-auto shrink-0 p-4">
          <div className="mb-6"><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-900">Companies ({c.company?1:0})</h3><button className="text-xs text-teal-600">+ Add</button></div>{c.company&&<div className="border border-gray-200 rounded-lg p-3"><div className="text-sm font-medium text-teal-600">{c.company}</div><Badge variant="teal">Primary</Badge></div>}</div>
          <div className="mb-6"><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-900">Deals ({relatedDeals.length})</h3><button className="text-xs text-teal-600">+ Add</button></div>{relatedDeals.map(d=><div key={d.id} className="border border-gray-200 rounded-lg p-3 mb-2"><div className="text-sm font-medium text-teal-600">{d.name}</div><div className="text-xs text-gray-400">Stage: {d.stage}</div><div className="text-xs text-gray-400">Amount: {d.amount?`$${(d.amount/1000000).toFixed(0)}M`:"--"}</div></div>)}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANIES VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function CompaniesView({ contacts, onSelectCompany }) {
  const firms=useMemo(()=>{const map={};contacts.forEach(c=>{if(!c.company)return;if(!map[c.company])map[c.company]={name:c.company,contacts:[],domain:COMPANIES_DATA.find(co=>co.name===c.company)?.domain||""};map[c.company].contacts.push(c);});return Object.values(map);},[contacts]);
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0"><div className="flex items-center gap-2"><Building2 size={14} className="text-gray-500"/><span className="text-sm font-medium text-gray-700">Companies</span><span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{firms.length}</span></div><button className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded">Add company +</button></div>
      <div className="flex-1 overflow-auto">
        <table className="w-full"><thead className="sticky top-0 bg-gray-50 z-10"><tr className="border-b border-gray-200"><th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300"/></th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Company Name</th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Domain</th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Contacts</th></tr></thead>
          <tbody>{firms.map(f=><tr key={f.name} className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer" onClick={()=>onSelectCompany(f.name)}><td className="px-3 py-2" onClick={e=>e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300"/></td><td className="px-3 py-2"><span className="text-sm font-medium text-teal-600 hover:underline">{f.name}</span></td><td className="px-3 py-2 text-sm text-teal-600">{f.domain}</td><td className="px-3 py-2"><div className="flex -space-x-1">{f.contacts.slice(0,4).map(c=><Avatar key={c.id} name={c.name} size="xs"/>)}{f.contacts.length>4&&<span className="text-xs text-gray-400 ml-2">+{f.contacts.length-4}</span>}</div></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function CompanyDetailView({ companyName, contacts, onBack, onSelectContact }) {
  const co=COMPANIES_DATA.find(c=>c.name===companyName);
  const cc=contacts.filter(c=>c.company===companyName);
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 shrink-0"><button onClick={onBack} className="text-sm text-teal-600 hover:underline flex items-center gap-1"><ChevronLeft size={14}/>Companies</button></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r border-gray-200 p-5 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900">{companyName}</h2>
          {co&&<div className="text-sm text-teal-600">{co.domain}</div>}
          <div className="space-y-3 mt-4">
            <div><div className="text-xs text-gray-500">Fund Type</div><div className="text-sm text-gray-900">{co?.fundType||"--"}</div></div>
            <div><div className="text-xs text-gray-500">Typical Check Size</div><div className="text-sm text-gray-900">{co?.typicalCheckSize?`$${co.typicalCheckSize.toLocaleString()}`:"--"}</div></div>
            <div><div className="text-xs text-gray-500">Preferred Capital Types</div><div className="text-sm text-gray-900">{co?.preferredCapitalTypes||"--"}</div></div>
            <div><div className="text-xs text-gray-500">Total Contacts</div><div className="text-sm text-gray-900 font-medium">{cc.length}</div></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Contacts at {companyName}</h3>
          <table className="w-full"><thead><tr className="border-b border-gray-200"><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Name</th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Email</th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Phone</th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Lead Status</th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Capital Type</th></tr></thead>
            <tbody>{cc.map(c=><tr key={c.id} className="border-b border-gray-100 hover:bg-blue-50"><td className="px-3 py-2"><button onClick={()=>onSelectContact(c)} className="text-sm text-teal-600 hover:underline flex items-center gap-2"><Avatar name={c.name} size="xs"/>{c.name}</button></td><td className="px-3 py-2">{c.email?<a href={`mailto:${c.email}`} className="text-sm text-teal-600 hover:underline">{c.email}</a>:"--"}</td><td className="px-3 py-2">{c.phone?<a href={`tel:${c.phone}`} className="text-sm text-teal-600 hover:underline">{c.phone}</a>:"--"}</td><td className="px-3 py-2 text-sm text-gray-600">{c.leadStatus||"--"}</td><td className="px-3 py-2 text-sm text-gray-600 truncate max-w-xs">{c.capitalType||"--"}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEALS PIPELINE (Kanban) — with schema-aware deal stages
   ═══════════════════════════════════════════════════════════════════════════ */

function DealsView({ contacts, onSelectDeal }) {
  const sc={"Overviews":"border-t-gray-400","Deal Review":"border-t-orange-400","LOI Sent":"border-t-teal-400","Sourcing":"border-t-blue-400","Closed":"border-t-green-400","On Hold":"border-t-amber-400","Pass":"border-t-red-400"};
  const fmt=n=>n?`$${(n/1000000).toFixed(0)}M`:"--";
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white shrink-0 px-4 py-2 flex items-center justify-between"><div className="flex items-center gap-2"><Columns3 size={14} className="text-gray-500"/><span className="text-sm font-medium text-gray-700">TREP Pipeline</span><span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-semibold">{DEALS.length}</span></div><div className="flex items-center gap-2"><button className="text-sm text-gray-600 border border-gray-300 rounded px-2.5 py-1.5 hover:bg-gray-50 flex items-center gap-1"><Filter size={13}/>Filters</button><button className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded">Add deals +</button></div></div>
      <div className="flex-1 overflow-x-auto px-4 pt-4 pb-2">
        <div className="flex gap-3 h-full min-w-max">
          {PIPELINE_STAGES.map(stage=>{const sd=DEALS.filter(d=>d.stage===stage);const tot=sd.reduce((s,d)=>s+(d.amount||0),0);return(
            <div key={stage} className="w-60 flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1"><span className="text-sm font-semibold text-gray-700">{stage} <span className="text-xs text-gray-400">{sd.length}</span></span></div>
              <div className="flex-1 space-y-2">
                {sd.map(deal=>(
                  <button key={deal.id} onClick={()=>onSelectDeal(deal)} className={`w-full text-left bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow border-t-2 ${sc[stage]||"border-t-gray-300"}`}>
                    <div className="text-sm font-semibold text-teal-600 mb-1">{deal.name}</div>
                    <div className="text-xs text-gray-500 space-y-0.5"><div>Amount: {fmt(deal.amount)}</div><div>Close: {deal.closeDate}</div><div>Owner: {deal.dealOwner}</div>{deal.assetClass&&<div>Asset: <Badge variant="teal">{deal.assetClass}</Badge></div>}{deal.dueDiligenceStatus&&<div>DD: {deal.dueDiligenceStatus}</div>}</div>
                    {deal.overdue&&<div className="mt-2"><Badge variant="red">Overdue</Badge></div>}
                    {deal.contactIds?.length>0&&<div className="flex -space-x-1 mt-2">{deal.contactIds.slice(0,5).map(cid=>{const ct=contacts.find(c=>c.id===cid);return ct?<Avatar key={cid} name={ct.name} size="xs"/>:null;})}{deal.contactIds.length>5&&<span className="text-xs text-gray-400 ml-2">+{deal.contactIds.length-5}</span>}</div>}
                    <div className="flex gap-2.5 mt-2 pt-2 border-t border-gray-100">{[FileText,Plus,Mail,Edit3].map((Ic,i)=><span key={i} className="text-teal-600"><Ic size={13}/></span>)}</div>
                  </button>
                ))}
                {sd.length===0&&<div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-8"/>}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 px-1">{fmt(tot)} | Total</div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEAL DETAIL — schema-aware properties
   ═══════════════════════════════════════════════════════════════════════════ */

function DealDetailView({ deal, contacts, onBack, onSelectContact }) {
  const [activeTab,setActiveTab]=useState("contacts_list");
  const dc=deal.contactIds?.map(cid=>contacts.find(c=>c.id===cid)).filter(Boolean)||[];
  const fmt=n=>n?`$${(n/1000000).toFixed(0)}M`:"--";
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 shrink-0"><button onClick={onBack} className="text-sm text-teal-600 hover:underline flex items-center gap-1"><ChevronLeft size={14}/>Deals</button></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r border-gray-200 overflow-y-auto p-5">
          <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center"><Columns3 size={16} className="text-gray-400"/></div><h2 className="text-xl font-bold text-gray-900">{deal.name}</h2></div>
          <div className="text-sm text-gray-500 space-y-0.5 ml-14 mb-4"><div>Amount: {fmt(deal.amount)}</div><div>Close: {deal.closeDate}</div><div>Stage: <span className="text-teal-600">{deal.stage}</span></div></div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">About this deal</h3>
          <div className="space-y-3">
            {[["Amount","amount"],["Deal Owner","dealOwner"],["Asset Class","assetClass"],["Location","location"],["Due Diligence","dueDiligenceStatus"],["Expected Investment","expectedInvestmentAmount"]].map(([l,k])=>(
              <div key={l}><div className="text-xs text-gray-500">{l}</div><div className="text-sm text-gray-900">{k==="amount"?fmt(deal[k]):k==="assetClass"&&deal[k]?<Badge variant="teal">{deal[k]}</Badge>:k==="expectedInvestmentAmount"?fmt(deal[k]):(deal[k]||"--")}</div></div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-gray-200 px-6 shrink-0">{["Activities","Contacts List","NDA Tracking"].map(t=><button key={t} onClick={()=>setActiveTab(t.toLowerCase().replace(/ /g,"_"))} className={`px-4 py-3 text-sm border-b-2 ${activeTab===t.toLowerCase().replace(/ /g,"_")?"border-teal-500 text-gray-900 font-medium":"border-transparent text-gray-500"}`}>{t}</button>)}</div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {activeTab==="contacts_list"&&<table className="w-full"><thead><tr className="border-b border-gray-200"><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Name</th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Lead Status</th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Email</th><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Phone</th></tr></thead><tbody>{dc.map(c=><tr key={c.id} className="border-b border-gray-100 hover:bg-blue-50"><td className="px-3 py-2"><button onClick={()=>onSelectContact(c)} className="text-sm text-teal-600 hover:underline flex items-center gap-2"><Avatar name={c.name} size="xs"/>{c.name}</button></td><td className="px-3 py-2 text-sm text-gray-600">{c.leadStatus||"--"}</td><td className="px-3 py-2">{c.email?<a href={`mailto:${c.email}`} className="text-sm text-teal-600">{c.email}</a>:"--"}</td><td className="px-3 py-2">{c.phone?<a href={`tel:${c.phone}`} className="text-sm text-teal-600">{c.phone}</a>:"--"}</td></tr>)}</tbody></table>}
            {activeTab==="activities"&&<div className="py-12 text-center text-sm text-gray-400">Activity timeline for this deal.</div>}
            {activeTab==="nda_tracking"&&<div><h3 className="text-base font-bold text-gray-900 mb-4">DocuSign integration</h3><div className="py-16 text-center bg-gray-50 rounded-lg border border-gray-200"><FileText size={28} className="mx-auto text-gray-300 mb-3"/><p className="text-sm text-gray-500">No envelopes match current filters.</p></div></div>}
          </div>
        </div>
        <div className="w-72 border-l border-gray-200 overflow-y-auto p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Contacts ({dc.length})</h3>
          {dc.slice(0,4).map(c=><div key={c.id} className="border border-gray-200 rounded-lg p-2.5 mb-2"><button onClick={()=>onSelectContact(c)} className="text-sm text-teal-600 hover:underline flex items-center gap-2"><Avatar name={c.name} size="xs"/>{c.name}</button><div className="text-xs text-gray-400 ml-8">{c.company}</div></div>)}
          {deal.attachments?.length>0&&<><h3 className="text-sm font-bold text-gray-900 mt-4 mb-2">Attachments</h3>{deal.attachments.map((a,i)=><div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"><FileText size={14} className="text-red-400"/><span className="text-xs text-teal-600">{a}</span></div>)}</>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS
   ═══════════════════════════════════════════════════════════════════════════ */

function SettingsView() {
  return (<div className="p-8 max-w-3xl bg-white h-full"><h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1><p className="text-sm text-gray-500 mb-6">Super Admin access only</p><div className="space-y-3">{[{t:"User Management",d:"Add, edit, or deactivate team members."},{t:"Pipeline Configuration",d:"Customize deal stages and fields."},{t:"Integration Keys",d:"DocuSign, email sync, data providers."},{t:"Data & Permissions",d:"Field-level access and export policies."}].map(s=><div key={s.t} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm"><div><div className="text-sm font-semibold text-gray-900">{s.t}</div><div className="text-xs text-gray-500">{s.d}</div></div><button className="text-sm text-teal-600">Configure →</button></div>)}</div></div>);
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════════ */

export default function App() {
  const [activeUser,setActiveUser]=useState(USERS_DATA[0]);
  const [activeView,setActiveView]=useState("dashboard");
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [contacts,setContacts]=useState(initialContacts);
  const [selectedContact,setSelectedContact]=useState(null);
  const [selectedDeal,setSelectedDeal]=useState(null);
  const [selectedCompany,setSelectedCompany]=useState(null);

  const updateContact=useCallback((id,key,value)=>{
    setContacts(prev=>prev.map(c=>c.id===id?{...c,[key]:value}:c));
    setSelectedContact(prev=>prev&&prev.id===id?{...prev,[key]:value}:prev);
  },[]);

  const navTo=useCallback(v=>{setSelectedContact(null);setSelectedDeal(null);setSelectedCompany(null);setActiveView(v);},[]);
  const handleUserSwitch=useCallback(user=>{setActiveUser(user);if(activeView==="settings"&&user.role!=="Super Admin")navTo("dashboard");},[activeView,navTo]);

  const content=selectedContact
    ?<ContactDetailView contact={selectedContact} onBack={()=>setSelectedContact(null)} contacts={contacts} updateContact={updateContact}/>
    :selectedDeal
    ?<DealDetailView deal={selectedDeal} contacts={contacts} onBack={()=>setSelectedDeal(null)} onSelectContact={setSelectedContact}/>
    :selectedCompany
    ?<CompanyDetailView companyName={selectedCompany} contacts={contacts} onBack={()=>setSelectedCompany(null)} onSelectContact={setSelectedContact}/>
    :activeView==="dashboard"?<DashboardView/>
    :activeView==="contacts"?<ContactsView contacts={contacts} updateContact={updateContact} onSelectContact={setSelectedContact} onSelectCompany={setSelectedCompany}/>
    :activeView==="companies"?<CompaniesView contacts={contacts} onSelectCompany={setSelectedCompany}/>
    :activeView==="deals"?<DealsView contacts={contacts} onSelectDeal={setSelectedDeal}/>
    :activeView==="settings"?<SettingsView/>
    :null;

  return (
    <div className="flex bg-white overflow-hidden" style={{ fontFamily:"'Lexend Deca',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",height:"100vh",minHeight:"100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <Sidebar activeView={activeView} setActiveView={navTo} user={activeUser} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}/>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",backgroundColor:"#33475b" }} className="shrink-0">
          <ObjectSwitcher activeView={activeView} setActiveView={navTo}/>
          <div style={{ display:"flex",alignItems:"center",gap:6,paddingRight:16 }}>
            {USERS_DATA.map(u=><button key={u.id} onClick={()=>handleUserSwitch(u)} style={{ fontSize:10,padding:"4px 8px",borderRadius:4,backgroundColor:activeUser.id===u.id?"#14b8a6":"rgba(255,255,255,0.12)",color:activeUser.id===u.id?"#fff":"#b0bec5" }}>{u.initials}</button>)}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">{content}</div>
      </div>
    </div>
  );
}
