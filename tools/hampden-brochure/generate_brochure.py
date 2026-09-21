#!/usr/bin/env python3
"""Hampden board brochure: editorial print edition, September 21, 2026.
Run python3 generate.py --output path/to/brochure.pdf.
Requires reportlab, svglib and Pillow. Assets and fonts are bundled.
"""
from pathlib import Path
from io import BytesIO
import argparse, base64, re
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg

ROOT=Path(__file__).resolve().parent
ap=argparse.ArgumentParser(); ap.add_argument('--output',type=Path,default=ROOT/'Hampden-Board-Brochure.pdf'); args=ap.parse_args()
args.output.parent.mkdir(parents=True,exist_ok=True)
for name,fn in [('Inter','Inter-Regular.ttf'),('Inter-Semi','Inter-SemiBold.ttf'),('Cormorant','CormorantGaramond-SemiBold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(ROOT/'fonts'/fn)))
pdfmetrics.registerFontFamily('Inter',normal='Inter',bold='Inter-Semi',italic='Inter',boldItalic='Inter-Semi')
W,H=612,792; M=44; CW=524
INK=HexColor('#29242A'); MUTED=HexColor('#696269'); ACCENT=HexColor('#8C554A'); PAPER=HexColor('#F5F2ED'); LINE=HexColor('#DCD5CC')
SITE='https://hampden-board-site.vercel.app/'
FANNIE='https://singlefamily.fanniemae.com/media/document/pdf/lender-letter-ll-2026-03-updates-project-standards-property-insurance-requirements'
CHICAGO='https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2658975'
c=canvas.Canvas(str(args.output),pagesize=(W,H),pageCompression=1)
c.setTitle('2629 North Hampden Court | Board Brochure')
c.setAuthor('Matthew Neistat | The Neistat Group')
c.setSubject('A clear place to start: valuation, options and representation')
checks=[];page=0

def rect(x,t,w,h,color):
    c.setFillColor(color);c.rect(x,H-t-h,w,h,stroke=0,fill=1)
def line(t,x=M,w=CW):
    c.setStrokeColor(LINE);c.setLineWidth(.55);c.line(x,H-t,x+w,H-t)
def p(txt,x,t,w=CW,size=10.8,lead=15.2,font='Inter',color=INK):
    q=Paragraph(txt,ParagraphStyle('x',fontName=font,fontSize=size,leading=lead,textColor=color))
    _,h=q.wrap(w,1000);q.drawOn(c,x,H-t-h)
    checks.append((page,re.sub('<[^>]+>','',txt)[:55],t,t+h))
    return t+h

def label(txt,x,t,color=MUTED,size=7.2,space=1.25):
    c.saveState();c.setFillColor(color);c.setFont('Inter-Semi',size)
    q=c.beginText(x,H-t-size);q.setCharSpace(space);q.textOut(txt.upper());c.drawText(q);c.restoreState()

def logo(fn,x,t,w):
    source=(ROOT/'assets'/fn).read_bytes();embedded=None
    if fn=='reference-2.svg':
        m=re.search(rb'<image[^>]+data:image/png;base64,([^\"]+)"[^>]*/>',source)
        if m:embedded=base64.b64decode(m.group(1));source=source[:m.start()]+source[m.end():]
    d=svg2rlg(BytesIO(source));s=w/d.width;d.scale(s,s);renderPDF.draw(d,c,x,H-t-d.height*s)
    if embedded:
        q=w/1490.92
        c.drawImage(ImageReader(BytesIO(embedded)),x+(944-67.081)*q,H-t-(97-29+88)*q,542*q,88*q,mask='auto')

def photo(x,t,w,h,focus=.48):
    im=Image.open(ROOT/'assets/reference-1.jpg').convert('RGB')
    ratio=w/h
    if im.width/im.height>ratio:
        cropw=im.height*ratio;left=(im.width-cropw)*focus;box=(left,0,left+cropw,im.height)
    else:
        croph=im.width/ratio;top=(im.height-croph)*focus;box=(0,top,im.width,top+croph)
    im=im.crop(box)
    b=BytesIO();im.save(b,format='JPEG',quality=94,optimize=True);b.seek(0)
    c.drawImage(ImageReader(b),x,H-t-h,w,h)

def base(n,title):
    global page
    page=n
    rect(0,0,W,H,white)
    if n>1:
        label('2629 NORTH HAMPDEN COURT',M,31,size=7,space=1)
        c.setFont('Inter',7.3);c.setFillColor(MUTED);c.drawRightString(W-M,H-38,title)
        line(53)
    line(754)
    c.setFont('Inter',7.2);c.setFillColor(MUTED)
    c.drawString(M,22,'THE NEISTAT GROUP')
    c.drawRightString(W-M,22,f'{n:02d} / 04')

def heading(kicker,title,sub=None):
    label(kicker,M,84,color=ACCENT)
    t=p(title,M,101,CW,size=35,lead=36,font='Cormorant')
    if sub:t=p(sub,M,t+10,CW,size=11,lead=15.5,color=MUTED)
    return t

# COVER: one large image, clear title, restrained supporting information.
base(1,'Board advisory')
logo('reference-0.svg',M,35,154)
label('BOARD ADVISORY',412,39,size=7,space=1)
p('September 2026',412,52,156,size=8.5,lead=12,color=MUTED)
label('LINCOLN PARK / CHICAGO',M,105,color=ACCENT)
p('2629 North<br/>Hampden Court',M,121,420,size=45,lead=42,font='Cormorant')
photo(M,227,CW,317,focus=.68)
p('<link href="https://www.zillow.com/homedetails/2629-N-Hampden-Ct-APT-204-Chicago-IL-60614/3726053_zpid/" color="#696269">Property photo: Zillow</link>',M,550,230,size=6.8,lead=9,color=MUTED)
p('Know the value.<br/>Then decide.',M,576,230,size=29,lead=29,font='Cormorant')
p('Start with a complimentary valuation. Understand the building\'s value, then choose the sale strategy that fits the owners\' priorities.',323,578,245,size=10.5,lead=15.5)
line(653)
for x,val,desc in [(M,'67*','Reported units'),(231,'34','Deeded parking spaces'),(425,'1970','Reported year built')]:
    p(val,x,665,150,size=24,lead=25,font='Cormorant')
    p(desc,x,694,160,size=8.2,lead=11,color=MUTED)
p('Reported figures are unverified. *Confirm the 66-parcel / 67-unit discrepancy against the declaration.',M,727,CW,size=7.7,lead=10.5,color=MUTED)
c.showPage()

# OPTIONS: two sale choices, with two marketing methods under the full-building sale.
base(2,'The options')
heading('YOUR OPTIONS','Two ways to move forward.','Sell the full building, or package the units of willing owners.')
line(179)
p('01',M,195,35,size=26,lead=29,font='Cormorant',color=ACCENT)
p('Sell the full building',94,195,474,size=23,lead=28,font='Cormorant')
p('Market the entire property as one transaction, using one of two approaches.',94,231,474,size=10.5,lead=15,color=MUTED)
label('TWO MARKETING APPROACHES',M,266,color=ACCENT)
p('Full public marketing',M,289,246,size=12,lead=16,font='Inter-Semi')
p('List the property publicly, market it broadly, respond to inquiries, and arrange building showings.',M,315,246,size=10.5,lead=15,color=MUTED)
p('Confidential targeted outreach',322,289,246,size=12,lead=16,font='Inter-Semi')
p('Approach selected brokers, buyers, and institutions. Require every participant to sign an NDA/confidentiality agreement before receiving confidential materials. Arrange showings only after confirming serious interest and the buyer\'s ability to proceed.',322,315,246,size=10.5,lead=15,color=MUTED)
for x,adv,trade in [
    (M,'Wider exposure and buyer competition.','More public exposure and showing activity.'),
    (322,'A quieter process with controlled access.','A smaller buyer pool may limit competition.')]:
    label('ADVANTAGE',x,458,color=ACCENT)
    p(adv,x,474,246,size=10.4,lead=14.5)
    label('TRADEOFF',x,513,color=ACCENT)
    p(trade,x,529,246,size=10.4,lead=14.5,color=MUTED)
line(577)
p('02',M,591,35,size=26,lead=29,font='Cormorant',color=ACCENT)
p('Voluntary group sale',94,591,474,size=23,lead=28,font='Cormorant')
p('Package only the units of owners who choose to sell together and market them as one offering. Participation is voluntary; pricing depends on the units included.',94,627,474,size=10.5,lead=15,color=MUTED)
p('<b>Marketing:</b> Participating sellers agree on public or targeted outreach.',94,681,474,size=10.2,lead=14.5)
p('<b>Approval:</b> A full-building sale requires applicable owner approval. A group sale involves participating owners, with counsel reviewing restrictions.',M,718,CW,size=9,lead=12.5,color=MUTED)
c.showPage()

# VALUATION: two-column layout separates the short request from its purpose.
base(3,'The valuation')
heading('THE VALUATION','A clear place to start.','Send what you have. Approximate dates are fine; we can fill in gaps together.')
# Quiet architectural inset, reused from the actual facade.
photo(M,185,156,220,focus=.52)
p('The building, in context.',M,412,156,size=7.7,lead=11,color=MUTED)
p('Start with<br/>the valuation.',M,449,157,size=24,lead=25,font='Cormorant')
p('I will prepare a Broker Opinion of Value to help the board assess the building\'s value and sale options.',M,511,157,size=10.3,lead=15)
p('No listing agreement.<br/>No obligation to sell.',M,592,158,size=10.3,lead=15,font='Inter-Semi',color=ACCENT)
items=[
('Expenses','2025 operating expenses and, ideally, <nobr>Jan 1-Sept 1, 2026</nobr> expenses.'),
('Capital improvements','Work completed in the last five years and anything planned or needed, with costs if available.'),
('Building ages','Approximate ages of the roof, elevator, masonry, windows, and boiler.'),
('Maintenance','Any sprinkler updates needed and when the driveway was last paved.'),
('Current rents','Unit numbers and monthly rents from owners willing to share. No tenant names needed.')]
t=185
for i,(h,b) in enumerate(items,1):
    label(f'0{i}',234,t+3,color=ACCENT,size=8,space=0)
    p(h,262,t,306,size=11.7,lead=15.5,font='Inter-Semi')
    y=p(b,262,t+23,306,size=10.5,lead=15,color=MUTED)
    if i<5:line(y+17,234,334)
    t=y+37
rect(M,664,CW,69,PAPER)
label('WHAT YOU WILL RECEIVE',M+18,678,color=ACCENT)
p('A supported value range to guide the sale strategy, informed by market evidence and capital needs.',M+18,696,CW-36,size=10.6,lead=15)
c.showPage()

# TERMS: give representation and advice equal weight; detailed lending notes live online.
base(4,'Representation & next steps')
heading('REPRESENTATION','Clear terms. A measured process.')
rect(M,160,CW,113,PAPER)
label('PROPOSED COMMISSION',M+18,176,color=ACCENT)
p('1.25%',M+18,192,170,size=38,lead=40,font='Cormorant')
p('of the final sale price',M+18,238,190,size=9.5,lead=13,font='Inter-Semi')
p('Payable to my brokerage at closing. All brokerage compensation is negotiable and subject to written agreement.',286,181,260,size=11,lead=16)
# Two side-by-side fee notes.
p('Buyer-broker compensation',M,297,250,size=11.5,lead=15,font='Inter-Semi')
p('Additional to my fee. Buyer brokers should state their requested compensation separately in the offer. The board can negotiate it with the other terms. Any seller-paid fee requires written agreement.',M,321,247,size=10.3,lead=14.5,color=MUTED)
p('Other closing costs',322,297,246,size=11.5,lead=15,font='Inter-Semi')
p('Separate from commission. Transfer taxes follow governing rates and transaction terms; title and legal fees require quotes. A title company may offer reduced pricing for a coordinated multi-unit transaction.',322,321,246,size=10.3,lead=14.5,color=MUTED)
line(422)
p('Before the board decides.',M,438,CW,size=24,lead=26,font='Cormorant')
p('Approval & ownership',M,481,247,size=11.2,lead=15,font='Inter-Semi')
p('Chicago requires at least 85% approval for a full-building sale unless the governing documents require more. Counsel must confirm voting interests, procedures, and owner protections, including the rights of dissenting owners.',M,504,247,size=10.1,lead=14.2,color=MUTED)
p('Resolve the 66-parcel / 67-unit discrepancy before calculating votes or allocating proceeds.',M,600,247,size=9.9,lead=14,color=MUTED)
p('Financing & verification',322,481,246,size=11.2,lead=15,font='Inter-Semi')
p('A lender must assess this building\'s eligibility under applicable condominium lending standards. Fannie Mae issued changes in 2026 affecting project review, reserves, and insurance.',322,504,246,size=10.1,lead=14.2,color=MUTED)
p('Building figures remain unverified. Individual unit sales do not establish the value of the entire building.',322,586,246,size=9.9,lead=14,color=MUTED)
p('<link href="'+CHICAGO+'" color="#8C554A">Chicago Code 13-72-085</link>  /  <link href="'+FANNIE+'" color="#8C554A">Fannie Mae LL-2026-03</link>  /  <link href="'+SITE+'#governance" color="#8C554A">Full background online</link>',M,645,CW,size=7.5,lead=10)
line(666)
logo('reference-2.svg',M,689,219)
p('Matthew Neistat',319,681,249,size=16.5,lead=19,font='Cormorant')
p('Investment Sales',319,704,249,size=8,lead=11,color=MUTED)
p('<link href="mailto:matt@theneistatgroup.com" color="#8C554A">matt@theneistatgroup.com</link>',319,720,249,size=9.3,lead=13)
p('Board discussion only; not an appraisal or commitment to sell. Consult legal, tax, and lending advisors.',M,740,CW,size=6.6,lead=8,color=MUTED)
c.showPage()
c.save()
for pn,txt,start,end in checks:
    if end>750:raise RuntimeError(f'Page {pn} text extends too low ({end:.1f}): {txt}')
print(args.output)
print('4 pages. Layout bounds passed.')
