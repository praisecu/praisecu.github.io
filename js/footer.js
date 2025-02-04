const footerTemplate = document.createElement('template');

footerTemplate.innerHTML = `
    <section class="cta-section" id="footer" style="background: #000; padding: 20px;">
        <p align="center">
            <a href="https://linkedin.com" title="LinkedIn">
                <span class="fa-brands fa-linkedin"></span>
            </a> &#160;&#160;&#160;
            <a href="https://github.com" title="Github">
                <span class="fa-brands fa-github"></span>
            </a> &#160;&#160;&#160;
        </p>
    </section>

    <footer class="copyright-section">
        <div class="container text-center">
            <div class="footer-menu">
                <div class="copyright-info">
                    <div class="praise-header">PRAISe Lab</div>
                    <br>
                    <h5 style="color: #aaa; margin-bottom: 5px;">
                        Perception, Robotics, AI and Sensing Lab<br>
                        University of Colorado, Boulder
                    </h5>
                    <h5 style="color: #aaa; font-size: 16px; font-weight: normal; margin-top: 0;">
                        Copyright &#169; <span id="current-year" style="font-weight: normal; font-size: inherit;"></span>
                    </h5>
                    <hr width="30%">
                </div>
            </div>
        </div> 
    </footer>
`;

class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(footerTemplate.content.cloneNode(true));

        // Automatically update year with correct styling
        const yearElement = shadowRoot.querySelector("#current-year");
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

customElements.define('footer-component', Footer);
