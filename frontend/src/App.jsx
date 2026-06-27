import { useEffect, useMemo, useState } from 'react'
import { api, authBlobUrl } from './api'

const icons = { Dashboard: '⌂', Books: '▤', 'My Library': '✓', Members: '♙', Sales: '$', Loans: '↔' }
const emptyBook = { title: '', author: '', isbn: '', category: '', description: '', price: 0, rating: 0, totalCopies: 1 }
const emptyMember = { name: '', email: '', phone: '', active: true }

function Login({ onLogin, onRegister }) {
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' })
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('')
    try { const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) }); localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data)); onLogin(data) }
    catch (err) { setError(err.message === 'Unexpected server error' ? 'Invalid username or password' : err.message) }
    finally { setBusy(false) }
  }
  return <main className="login-page"><section className="login-art"><div className="brand light"><span>❧</span> KitaabGhar</div><div className="art-copy"><p className="eyebrow">YOUR DIGITAL LIBRARY</p><h1>Every story deserves<br/>a place to be found.</h1><p>Browse, purchase, read, and manage books in one calm shelf.</p></div><div className="shelf">BOOKS · IDEAS · PEOPLE · STORIES</div></section><section className="login-panel"><form className="login-card" onSubmit={submit}><div className="mobile-brand">❧ KitaabGhar</div><p className="eyebrow">WELCOME BACK</p><h2>Sign in to your library</h2><p className="muted">Use the admin demo or your member account.</p><label>Username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required autoFocus/></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></label>{error && <div className="alert error">{error}</div>}<button className="primary wide" disabled={busy}>{busy ? 'Signing in…' : 'Enter the library'} <span>→</span></button><p className="demo-note">Admin: <b>admin</b> / <b>admin123</b></p><button type="button" className="register-link" onClick={onRegister}>New user? Create an account</button></form></section></main>
}

function Register({ onLogin, onBack }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setError('')
    if (form.password !== confirmPassword) { setError('Passwords do not match'); return }
    setBusy(true)
    try { const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(form) }); localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data)); onLogin(data) }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <main className="login-page"><section className="login-art"><div className="brand light"><span>❧</span> KitaabGhar</div><div className="art-copy"><p className="eyebrow">YOUR DIGITAL LIBRARY</p><h1>A new chapter<br/>starts here.</h1><p>Create a member account to purchase and read books.</p></div><div className="shelf">BOOKS · IDEAS · PEOPLE · STORIES</div></section><section className="login-panel"><form className="login-card" onSubmit={submit}><div className="mobile-brand">❧ KitaabGhar</div><p className="eyebrow">JOIN KITAABGHAR</p><h2>Create your account</h2><label>Username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} minLength={3} maxLength={50} pattern="[A-Za-z0-9._-]+" required autoFocus/></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength={8} maxLength={72} required/></label><label>Confirm password<input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} minLength={8} maxLength={72} required/></label>{error && <div className="alert error">{error}</div>}<button className="primary wide" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <span>→</span></button><button type="button" className="register-link" onClick={onBack}>Already registered? Sign in</button></form></section></main>
}

function Modal({ title, children, onClose }) {
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal wide-modal"><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}>×</button></div>{children}</div></div>
}

function Layout({ user, onLogout }) {
  const isAdmin = user.role === 'ADMIN'
  const pages = isAdmin ? ['Dashboard','Books','Members','Sales','Loans'] : ['Books','My Library']
  const [page, setPage] = useState(isAdmin ? 'Dashboard' : 'Books')
  const [data, setData] = useState({ books:[], purchases:[], members:[], loans:[], dashboard:{} })
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [loading, setLoading] = useState(true)
  const refresh = async () => {
    setLoading(true); setError('')
    try {
      if (isAdmin) {
        const [books,members,loans,dashboard,purchases] = await Promise.all([api('/books'),api('/members'),api('/loans'),api('/dashboard'),api('/books/purchases/all')])
        setData({books,members,loans,dashboard,purchases})
      } else {
        const [books,purchases] = await Promise.all([api('/books'),api('/books/purchases')])
        setData(current=>({...current,books,purchases}))
      }
    } catch(e){ setError(e.message) } finally { setLoading(false) }
  }
  useEffect(()=>{ refresh() },[])
  const flash = msg => { setNotice(msg); setTimeout(()=>setNotice(''),2500); refresh() }
  return <div className="app-shell"><aside><div className="brand"><span>❧</span> KitaabGhar</div><p className="side-label">{isAdmin?'ADMIN DESK':'MEMBER SHELF'}</p><nav>{pages.map(n=><button key={n} className={page===n?'active':''} onClick={()=>setPage(n)}><span>{icons[n]}</span>{n}</button>)}</nav><div className="account"><div className="avatar">{user.username[0].toUpperCase()}</div><div><b>{user.username}</b><small>{user.role}</small></div><button title="Sign out" onClick={onLogout}>↪</button></div></aside><main className="content"><header><button className="mobile-menu">❧</button><div><p className="eyebrow">KITAABGHAR LIBRARY</p><h1>{page}</h1></div><div className="date">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div></header>{error&&<div className="alert error">{error}</div>}{notice&&<div className="toast">✓ {notice}</div>}{loading?<div className="loader">Opening the catalogue…</div>:<>{isAdmin&&page==='Dashboard'&&<Dashboard data={data}/>} {page==='Books'&&<Books data={data.books} purchases={data.purchases} flash={flash} setError={setError} isAdmin={isAdmin}/>} {!isAdmin&&page==='My Library'&&<MyLibrary purchases={data.purchases}/>} {isAdmin&&page==='Members'&&<Members data={data.members} purchases={data.purchases} flash={flash} setError={setError}/>} {isAdmin&&page==='Sales'&&<Sales data={data}/>} {isAdmin&&page==='Loans'&&<Loans data={data} flash={flash} setError={setError}/>}</>}</main></div>
}

function Dashboard({ data }) {
  const stats=[['Books',data.dashboard.books,'▤'],['Members',data.dashboard.members,'♙'],['Purchases',data.dashboard.purchases,'✓'],['Sales',currency(data.dashboard.sales),'$']]
  return <><section className="hero"><div><p className="eyebrow">GOOD TO SEE YOU</p><h2>Your e-library is<br/>ready for readers.</h2><p>Track catalogue, purchases, members, and sales from one admin desk.</p></div><div className="hero-mark">❧</div></section><section className="stats">{stats.map(([label,value,icon])=><article key={label}><span>{icon}</span><div><strong>{value??0}</strong><p>{label}</p></div></article>)}</section><section className="panel"><div className="panel-title"><p className="eyebrow">LATEST SALES</p><h2>Recent purchases</h2></div><PurchaseTable purchases={data.purchases.slice(0,5)} showUser/></section></>
}

function Books({ data, purchases=[], flash, setError, isAdmin }) {
  const [query,setQuery]=useState(''); const [editing,setEditing]=useState(null); const [details,setDetails]=useState(null)
  const purchasedIds = useMemo(()=>new Set(purchases.map(p=>p.book.id)),[purchases])
  const filtered=useMemo(()=>data.filter(b=>[b.title,b.author,b.category].some(v=>(v||'').toLowerCase().includes(query.toLowerCase()))),[data,query])
  async function remove(id){ if(!confirm('Remove this book from the catalogue? Existing purchase history will stay safe.'))return; try{await api(`/books/${id}`,{method:'DELETE'});flash('Book removed from catalogue')}catch(e){setError(e.message)} }
  async function purchase(book){ if(!confirm(`Purchase ${book.title} for ${currency(book.price)}?`))return; try{await api(`/books/${book.id}/purchase`,{method:'POST'});flash('Book purchased')}catch(e){setError(e.message)} }
  return <><Toolbar title="The catalogue" subtitle={isAdmin?`${data.length} titles in your collection`:'Browse, search, purchase, and read books'} query={query} setQuery={setQuery} action={isAdmin?'Add a book':null} onAction={()=>setEditing(emptyBook)}/><section className="book-grid">{filtered.map(b=><BookCard key={b.id} book={b} isAdmin={isAdmin} purchased={purchasedIds.has(b.id)} onDetails={()=>setDetails(b)} onEdit={()=>setEditing(b)} onDelete={()=>remove(b.id)} onPurchase={()=>purchase(b)}/>)}</section>{!filtered.length&&<section className="panel"><Empty text="No books found"/></section>}{isAdmin&&editing&&<BookForm book={editing} close={()=>setEditing(null)} done={m=>{setEditing(null);flash(m)}} setError={setError}/>} {details&&<BookDetails book={details} purchased={isAdmin||purchasedIds.has(details.id)} isAdmin={isAdmin} onPurchase={()=>purchase(details)} onClose={()=>setDetails(null)}/>}</>
}

function BookCard({ book, isAdmin, purchased, onDetails, onEdit, onDelete, onPurchase }) {
  return <article className="book-card"><Cover book={book}/><div className="book-meta"><span className="tag">{book.category||'General'}</span><h3>{book.title}</h3><p className="muted">by {book.author}</p><p className="rating">★ {Number(book.rating||0).toFixed(1)} · {currency(book.price)}</p><p>{(book.description||'No description added yet.').slice(0,105)}{(book.description||'').length>105?'…':''}</p></div><div className="book-actions"><button onClick={onDetails}>Details</button>{isAdmin?<><button onClick={onEdit}>Edit</button><button className="danger" onClick={onDelete}>Delete</button></>:purchased?<span className="status available">Purchased</span>:<button className="purchase" disabled={!book.availableCopies} onClick={onPurchase}>{book.availableCopies?'Purchase':'Out of stock'}</button>}</div></article>
}

function Cover({ book }) {
  const [url,setUrl]=useState('')
  useEffect(()=>{ let live=true; if(!book.coverPath){setUrl('');return} authBlobUrl(`/books/${book.id}/cover`).then(u=>live&&setUrl(u)).catch(()=>setUrl('')); return()=>{live=false;if(url)URL.revokeObjectURL(url)} },[book.id,book.coverPath])
  return url?<img className="cover" src={url} alt={book.title}/>:<div className="cover placeholder">❧</div>
}

function BookDetails({ book, purchased, isAdmin, onPurchase, onClose }) {
  const [reader,setReader]=useState(null)
  async function openPdf(path){ try{setReader(await authBlobUrl(path))}catch(e){alert(e.message)} }
  async function download(){ try{ const url=await authBlobUrl(`/books/${book.id}/download`); const a=document.createElement('a'); a.href=url; a.download=`${book.title}.pdf`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000) }catch(e){alert(e.message)} }
  return <Modal title={book.title} onClose={onClose}><div className="details"><Cover book={book}/><div><p className="eyebrow">{book.category||'GENERAL'}</p><h3>{book.title}</h3><p className="muted">by {book.author}</p><p className="rating">★ {Number(book.rating||0).toFixed(1)} · {currency(book.price)}</p><p>{book.description||'No description added yet.'}</p><p><b>ISBN:</b> {book.isbn}</p><p><b>Availability:</b> {book.availableCopies} of {book.totalCopies}</p><div className="detail-actions">{purchased?<><button className="primary" onClick={()=>openPdf(`/books/${book.id}/read`)}>{book.pdfPath?'Read PDF':'No PDF uploaded'}</button><button className="secondary" onClick={download} disabled={!book.pdfPath}>Download</button></>:!isAdmin&&<button className="primary" disabled={!book.availableCopies} onClick={onPurchase}>Purchase</button>}</div></div></div>{reader&&<div className="pdf-reader"><iframe src={reader} title={book.title}/></div>}</Modal>
}

function BookForm({ book, close, done, setError }) {
  const [form,setForm]=useState({...emptyBook,...book}); const [cover,setCover]=useState(null); const [pdf,setPdf]=useState(null); const edit=!!book.id
  async function upload(id,path,file){ if(!file)return; const body=new FormData(); body.append('file',file); await api(`/books/${id}/${path}`,{method:'POST',body}) }
  async function save(e){
    e.preventDefault()
    try{
      setError('')
      const payload={
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim(),
        category: (form.category||'').trim(),
        description: (form.description||'').trim(),
        price: Number(form.price||0),
        rating: Number(form.rating||0),
        totalCopies: Number(form.totalCopies||1),
        availableCopies: Number(form.availableCopies??form.totalCopies??1)
      }
      const saved=await api(edit?`/books/${book.id}`:'/books',{method:edit?'PUT':'POST',body:JSON.stringify(payload)})
      const uploadErrors=[]
      try{ await upload(saved.id,'cover',cover) }catch(err){ uploadErrors.push(`cover: ${err.message}`) }
      try{ await upload(saved.id,'pdf',pdf) }catch(err){ uploadErrors.push(`PDF: ${err.message}`) }
      done(uploadErrors.length ? `${edit?'Book updated':'Book added'}, but upload failed for ${uploadErrors.join(', ')}` : edit?'Book updated':'Book added')
    }catch(err){setError(err.message)}
  }
  return <Modal title={edit?'Edit book':'Add a new book'} onClose={close}><form className="form-grid" onSubmit={save}><label className="full">Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></label><label>Author<input value={form.author} onChange={e=>setForm({...form,author:e.target.value})} required/></label><label>Category<input value={form.category||''} onChange={e=>setForm({...form,category:e.target.value})}/></label><label>ISBN<input value={form.isbn} onChange={e=>setForm({...form,isbn:e.target.value})} required/></label><label>Price<input type="number" min="0" step="0.01" value={form.price??0} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Rating<input type="number" min="0" max="5" step="0.1" value={form.rating??0} onChange={e=>setForm({...form,rating:e.target.value})}/></label><label>Total copies<input type="number" min="1" value={form.totalCopies} onChange={e=>setForm({...form,totalCopies:e.target.value})} required/></label><label className="full">Description<textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Cover image<input type="file" accept="image/*" onChange={e=>setCover(e.target.files[0])}/></label><label>Book PDF<input type="file" accept=".pdf,application/pdf" onChange={e=>{const file=e.target.files[0]; if(file && !file.name.toLowerCase().endsWith('.pdf')){setError('Please select a PDF file'); e.target.value=''; setPdf(null); return} setError(''); setPdf(file)}}/></label><FormButtons close={close}/></form></Modal>
}

function MyLibrary({ purchases }) {
  const [query,setQuery]=useState('')
  const filtered=useMemo(()=>purchases.filter(p=>[p.book.title,p.book.author,p.book.category].some(v=>(v||'').toLowerCase().includes(query.toLowerCase()))),[purchases,query])
  return <><Toolbar title="My Library" subtitle={`${purchases.length} purchased ${purchases.length===1?'book':'books'}`} query={query} setQuery={setQuery}/><PurchaseTable purchases={filtered}/></>
}

function Sales({ data }) {
  return <><section className="stats"><article><span>$</span><div><strong>{currency(data.dashboard.sales)}</strong><p>Total sales</p></div></article><article><span>✓</span><div><strong>{data.dashboard.purchases||0}</strong><p>Total purchases</p></div></article><article><span>♙</span><div><strong>{data.dashboard.members||0}</strong><p>Members</p></div></article></section><section className="panel"><div className="panel-title"><p className="eyebrow">PURCHASE HISTORY</p><h2>Who purchased which book</h2></div><PurchaseTable purchases={data.purchases} showUser/></section></>
}

function PurchaseTable({ purchases, showUser=false }) {
  const [reader,setReader]=useState(null)
  async function read(book){ try{setReader({book,url:await authBlobUrl(`/books/${book.id}/read`)})}catch(e){alert(e.message)} }
  async function download(book){ try{const url=await authBlobUrl(`/books/${book.id}/download`); const a=document.createElement('a'); a.href=url; a.download=`${book.title}.pdf`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){alert(e.message)} }
  return <section className="panel table-panel"><table><thead><tr><th>Book</th>{showUser&&<th>Member</th>}<th>Price</th><th>Purchased</th><th></th></tr></thead><tbody>{purchases.map(p=><tr key={p.id}><td><b>{p.book.title}</b><small>{p.book.author}</small></td>{showUser&&<td>{p.username}</td>}<td>{currency(p.pricePaid)}</td><td>{new Date(p.purchasedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td><td className="actions"><button onClick={()=>read(p.book)} disabled={!p.book.pdfPath}>Read</button><button onClick={()=>download(p.book)} disabled={!p.book.pdfPath}>Download</button></td></tr>)}</tbody></table>{!purchases.length&&<Empty text="No purchases yet"/>}{reader&&<Modal title={reader.book.title} onClose={()=>setReader(null)}><div className="pdf-reader"><iframe src={reader.url} title={reader.book.title}/></div></Modal>}</section>
}

function Members({ data, purchases=[], flash, setError }) {
  const [query,setQuery]=useState(''); const [editing,setEditing]=useState(null)
  const memberPurchases=useMemo(()=>purchases.reduce((map,p)=>{const key=(p.username||'').toLowerCase(); if(!map[key])map[key]=[]; map[key].push(p); return map},{}),[purchases])
  const filtered=data.filter(m=>[m.name,m.email,m.phone].some(v=>(v||'').toLowerCase().includes(query.toLowerCase())) || (memberPurchases[(m.name||'').toLowerCase()]||[]).some(p=>[p.book.title,p.username].some(v=>(v||'').toLowerCase().includes(query.toLowerCase()))))
  async function remove(id){if(!confirm('Delete this member?'))return;try{await api(`/members/${id}`,{method:'DELETE'});flash('Member deleted')}catch(e){setError(e.message)}}
  return <><Toolbar title="Library members" subtitle={`${data.length} people belong here · ${purchases.length} purchases`} query={query} setQuery={setQuery} action="Add member" onAction={()=>setEditing(emptyMember)}/><section className="panel table-panel"><table><thead><tr><th>Member</th><th>Phone</th><th>Joined</th><th>Status</th><th>Purchased books</th><th></th></tr></thead><tbody>{filtered.map(m=>{const rows=memberPurchases[(m.name||'').toLowerCase()]||[]; return <tr key={m.id}><td><b>{m.name}</b><small>{m.email}</small></td><td>{m.phone}</td><td>{m.joinedDate}</td><td><span className={`status ${m.active?'available':'overdue'}`}>{m.active?'Active':'Inactive'}</span></td><td>{rows.length?<div className="purchase-list">{rows.map(p=><div key={p.id}><b>{p.username}</b><span>{p.book.title}</span><strong>{currency(p.pricePaid)}</strong></div>)}</div>:<span className="muted">No purchases</span>}</td><td className="actions"><button onClick={()=>setEditing(m)}>Edit</button><button className="danger" onClick={()=>remove(m.id)}>Delete</button></td></tr>})}</tbody></table>{!filtered.length&&<Empty text="No members found"/>}</section><section className="panel table-panel member-purchases"><div className="panel-title"><p className="eyebrow">MEMBER PURCHASES</p><h2>Purchased book details</h2></div><table><thead><tr><th>Member name</th><th>Book name</th><th>Price</th><th>Purchased</th></tr></thead><tbody>{purchases.map(p=><tr key={p.id}><td><b>{p.username}</b></td><td>{p.book.title}</td><td>{currency(p.pricePaid)}</td><td>{new Date(p.purchasedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td></tr>)}</tbody></table>{!purchases.length&&<Empty text="No member purchases yet"/>}</section>{editing&&<MemberForm member={editing} close={()=>setEditing(null)} done={m=>{setEditing(null);flash(m)}} setError={setError}/>}</>
}

function MemberForm({member,close,done,setError}) {
  const [form,setForm]=useState({...member}); const edit=!!member.id
  async function save(e){e.preventDefault();try{await api(edit?`/members/${member.id}`:'/members',{method:edit?'PUT':'POST',body:JSON.stringify(form)});done(edit?'Member updated':'Member added')}catch(err){setError(err.message)}}
  return <Modal title={edit?'Edit member':'Welcome a member'} onClose={close}><form className="form-grid" onSubmit={save}><label className="full">Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></label>{edit&&<label className="check full"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Active member</label>}<FormButtons close={close}/></form></Modal>
}

function Loans({data,flash,setError}) {
  const [show,setShow]=useState(false); const [filter,setFilter]=useState('ALL'); const loans=data.loans.filter(l=>filter==='ALL'||l.status===filter)
  async function returnBook(id){if(!confirm('Mark this book as returned?'))return;try{await api(`/loans/${id}/return`,{method:'PUT'});flash('Book returned')}catch(e){setError(e.message)}}
  return <><div className="toolbar"><div><p className="eyebrow">CIRCULATION</p><h2>Borrowing desk</h2><p className="muted">Issue books and record returns.</p></div><button className="primary" onClick={()=>setShow(true)}>+ Issue a book</button></div><div className="filters">{['ALL','BORROWED','OVERDUE','RETURNED'].map(f=><button className={filter===f?'active':''} key={f} onClick={()=>setFilter(f)}>{f.toLowerCase()}</button>)}</div><section className="panel table-panel"><LoanTable loans={loans} onReturn={returnBook}/></section>{show&&<LoanForm data={data} close={()=>setShow(false)} done={()=>{setShow(false);flash('Book issued')}} setError={setError}/>}</>
}

function LoanForm({data,close,done,setError}) {
  const [form,setForm]=useState({bookId:'',memberId:'',dueDate:new Date(Date.now()+14*86400000).toISOString().slice(0,10)})
  async function save(e){e.preventDefault();try{await api('/loans',{method:'POST',body:JSON.stringify({...form,bookId:Number(form.bookId),memberId:Number(form.memberId)})});done()}catch(err){setError(err.message)}}
  return <Modal title="Issue a book" onClose={close}><form className="form-grid" onSubmit={save}><label className="full">Book<select value={form.bookId} onChange={e=>setForm({...form,bookId:e.target.value})} required><option value="">Choose an available book</option>{data.books.filter(b=>b.availableCopies>0).map(b=><option key={b.id} value={b.id}>{b.title} — {b.availableCopies} available</option>)}</select></label><label className="full">Member<select value={form.memberId} onChange={e=>setForm({...form,memberId:e.target.value})} required><option value="">Choose an active member</option>{data.members.filter(m=>m.active).map(m=><option key={m.id} value={m.id}>{m.name} — {m.email}</option>)}</select></label><label className="full">Due date<input type="date" min={new Date().toISOString().slice(0,10)} value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} required/></label><FormButtons close={close}/></form></Modal>
}

function LoanTable({loans,onReturn}) { return loans.length?<table><thead><tr><th>Book</th><th>Member</th><th>Issued</th><th>Due</th><th>Status</th>{onReturn&&<th></th>}</tr></thead><tbody>{loans.map(l=><tr key={l.id}><td><b>{l.book.title}</b><small>{l.book.author}</small></td><td><b>{l.member.name}</b><small>{l.member.email}</small></td><td>{l.issuedDate}</td><td>{l.dueDate}</td><td><span className={`status ${l.status.toLowerCase()}`}>{l.status}</span></td>{onReturn&&<td className="actions">{l.status!=='RETURNED'&&<button className="return" onClick={()=>onReturn(l.id)}>Return</button>}</td>}</tr>)}</tbody></table>:<Empty text="No loans to show"/> }
function Toolbar({title,subtitle,query,setQuery,action,onAction}) {return <div className="toolbar"><div><p className="eyebrow">COLLECTION</p><h2>{title}</h2><p className="muted">{subtitle}</p></div><div className="toolbar-actions">{setQuery&&<input className="search" placeholder="Search by title, author, category…" value={query} onChange={e=>setQuery(e.target.value)}/>} {action&&<button className="primary" onClick={onAction}>+ {action}</button>}</div></div>}
function FormButtons({close}){return <div className="form-actions full"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary">Save</button></div>}
function Empty({text}){return <div className="empty"><span>⌕</span><p>{text}</p></div>}
function currency(value){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(Number(value||0))}

export default function App() {
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('user')||'null'))
  const [registering,setRegistering]=useState(false)
  const logout=()=>{localStorage.removeItem('token');localStorage.removeItem('user');setUser(null)}
  return user?<Layout user={user} onLogout={logout}/>:registering?<Register onLogin={setUser} onBack={()=>setRegistering(false)}/>:<Login onLogin={setUser} onRegister={()=>setRegistering(true)}/>
}
