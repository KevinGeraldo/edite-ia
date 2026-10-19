"""Remove o fundo de imagens: Vision do macOS no Mac (sem baixar modelo), rembg no Windows/Linux.

    .venv/bin/python tools/recorte.py saida_dir img1.jpg img2.jpg ...      (Mac)
    .venv\\Scripts\\python tools\\recorte.py saida_dir img1.jpg ...        (Windows; o rembg baixa o modelo u2net na 1ª vez)

Para cada imagem grava <nome>.png só com o sujeito (fundo transparente).
"""
import sys, os

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
if sys.platform != 'darwin':
    from rembg import remove, new_session
    from PIL import Image
    sess = new_session('isnet-general-use')
    for p in sys.argv[2:]:
        dest = os.path.join(out, os.path.splitext(os.path.basename(p))[0] + '.png')
        remove(Image.open(p), session=sess).save(dest); print(dest)
    sys.exit(0)

import Vision, Quartz
from Foundation import NSURL
ctx = Quartz.CIContext.contextWithOptions_(None)
for p in sys.argv[2:]:
    url = NSURL.fileURLWithPath_(os.path.abspath(p))
    handler = Vision.VNImageRequestHandler.alloc().initWithURL_options_(url, {})
    req = Vision.VNGenerateForegroundInstanceMaskRequest.alloc().init()
    ok, err = handler.performRequests_error_([req], None)
    res = req.results()
    if not ok or not res:
        print('sem sujeito:', p); continue
    obs = res[0]
    buf, err = obs.generateMaskedImageOfInstances_fromRequestHandler_croppedToInstancesExtent_error_(obs.allInstances(), handler, False, None)
    if buf is None:
        print('erro:', p, err); continue
    ci = Quartz.CIImage.imageWithCVPixelBuffer_(buf)
    dest = os.path.join(out, os.path.splitext(os.path.basename(p))[0] + '.png')
    cs = Quartz.CGColorSpaceCreateWithName(Quartz.kCGColorSpaceSRGB)
    ok = ctx.writePNGRepresentationOfImage_toURL_format_colorSpace_options_error_(
        ci, NSURL.fileURLWithPath_(os.path.abspath(dest)), Quartz.kCIFormatRGBA8, cs, {}, None)
    print(dest)
