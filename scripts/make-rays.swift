// Draws assets/images/awards/rays.png, the sunburst behind the avatar on the awards screen:
// white wedges on transparent, with a radial fade (opaque at the centre, transparent at the edge).
// Usage (macOS): swift scripts/make-rays.swift assets/images/awards/rays.png 768 16
import AppKit

let a = CommandLine.arguments
let out = a[1], size = Int(a[2])!, rays = Int(a[3])!
let cs = CGColorSpaceCreateDeviceRGB()
let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0, space: cs,
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
let c = CGFloat(size) / 2
let r = c * 1.5  // wedges reach past the corners; the fade hides their ends

// 1. Wedges (rays and gaps of the same angle).
ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
let step = 2 * CGFloat.pi / CGFloat(rays)
for i in 0..<rays {
    let a0 = CGFloat(i) * step - step / 4, a1 = a0 + step / 2
    ctx.move(to: CGPoint(x: c, y: c))
    ctx.addLine(to: CGPoint(x: c + r * cos(a0), y: c + r * sin(a0)))
    ctx.addLine(to: CGPoint(x: c + r * cos(a1), y: c + r * sin(a1)))
    ctx.closePath()
}
ctx.fillPath()

// 2. Radial fade: keep the wedges' alpha × a falloff from the centre (1) to the edge (0).
let img = ctx.makeImage()!
let out2 = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0, space: cs,
                     bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
let gradient = CGGradient(colorsSpace: cs, colors: [
    CGColor(red: 1, green: 1, blue: 1, alpha: 1),
    CGColor(red: 1, green: 1, blue: 1, alpha: 0.55),
    CGColor(red: 1, green: 1, blue: 1, alpha: 0),
] as CFArray, locations: [0, 0.45, 1])!
out2.drawRadialGradient(gradient, startCenter: CGPoint(x: c, y: c), startRadius: 0,
                        endCenter: CGPoint(x: c, y: c), endRadius: c, options: [])
out2.setBlendMode(.destinationIn)
out2.draw(img, in: CGRect(x: 0, y: 0, width: size, height: size))
let rep = NSBitmapImageRep(cgImage: out2.makeImage()!)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
