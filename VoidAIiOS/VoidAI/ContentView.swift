import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        VoidAIWebView()
            .ignoresSafeArea(edges: [.bottom])
            .background(Color(red: 0.035, green: 0.035, blue: 0.08))
    }
}

struct VoidAIWebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.035, green: 0.035, blue: 0.08, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor

        if let page = Bundle.main.url(forResource: "index", withExtension: "html") {
            webView.loadFileURL(
                page,
                allowingReadAccessTo: page.deletingLastPathComponent()
            )
        } else {
            webView.loadHTMLString(
                "<html><body style='background:#090914;color:white;font-family:sans-serif;padding:32px'><h2>VoidAI</h2><p>App files were not bundled. Please rebuild the project.</p></body></html>",
                baseURL: nil
            )
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
