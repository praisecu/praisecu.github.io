const footerTemplate = document.createElement('template');

footerTemplate.innerHTML = `

	<link href="css/team.css" rel="stylesheet"> 
    <!-- Web Fonts -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" />
    <link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,700,900,200italic,300italic,400italic,600italic,700italic,900italic' rel='stylesheet' type='text/css'>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,300" rel="stylesheet" type="text/css">

    <!-- Nunito Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap" rel="stylesheet">

    <!-- Bootstrap Core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <!-- Flaticon CSS -->
    <link href="fonts/flaticon/flaticon.css" rel="stylesheet">
    <!-- font-awesome CSS -->
    <link href="css/font-awesome.min.css" rel="stylesheet">
	<link href="css/all.min.css" rel="stylesheet">

    <!-- Offcanvas CSS -->
    <link href="css/hippo-off-canvas.css" rel="stylesheet">
    <!-- animate CSS -->
    <link href="css/animate.css" rel="stylesheet">
    <!-- language CSS -->
    <link href="css/language-select.css" rel="stylesheet">
    <!-- owl.carousel CSS -->
    <link href="owl.carousel/assets/owl.carousel.css" rel="stylesheet">
    <!-- magnific-popup -->
    <link href="css/magnific-popup.css" rel="stylesheet">
    <!-- Main menu -->
    <link href="css/menu.css" rel="stylesheet">
    <!-- Template Common Styles -->
    <link href="css/template.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/style.css" rel="stylesheet">
    <!-- Responsive CSS -->
    <link href="css/responsive.css" rel="stylesheet">
    <!-- Research CSS -->
    <link href="css/research.css" rel="stylesheet">
    <!-- ai-font for Research Fonts like Google Scholar -->
    <link rel="stylesheet" href="https://cdn.rawgit.com/jpswalsh/academicons/master/css/academicons.min.css">
    <!-- New PRAISe style CSS -->
    <link href="css/praise-style.css" rel="stylesheet">
    <!-- CSS for Cards -->
    <link href="css/cards.css" rel="stylesheet">


<!-- FOOTER -->
<section class="cta-section" id="footer" style="background: #000;">
<p align="center">
	 <a href="https://mailhide.io/e/c7L2GJRn" onclick="popup=window.open('https://mailhide.io/e/c7L2GJRn','mailhidepopup','width=580,height=635'); return false;"><span class="fa fa-envelope" aria-hidden="true"></span></a> &#160 &#160 &#160
<a href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=chahatdeep" title="LinkedIn"><span class="fa-brands fa-linkedin" aria-hidden="true"></span></a> &#160 &#160 &#160
<a href="https://twitter.com/intent/user?screen_name=chahatdeep" title="X (Formerly Twitter)"><span class="fa-brands fa-x-twitter" aria-hidden="true"></span></a> &#160 &#160 &#160
	<!-- <a href="https://www.youtube.com/channel/UCfKOzwtjSL07Xi4Xa19b2JA?sub_confirmation=1" title="YouTube"><span class="fa fa-youtube" style="font-size: 60px"></span></a> &#160 &#160 &#160 -->
	<a href="https://github.com/chahatdeep/" title="Github"><span class="fa-brands fa-square-github" aria-hidden="true"></span></a>  &#160 &#160 &#160
	<a href="https://www.google.com/maps/place/CU+Boulder+Engineering/@40.0071078,-105.2630886,18.8z/data=!4m6!3m5!1s0x876bedcb98970b19:0xa5dfeb8e8e2fbc8!8m2!3d40.0067943!4d-105.2628211!16s%2Fg%2F12xp_gt6y?entry=ttu" title="Location: CU Boulder"><span class="fa-solid fa-location-dot" aria-hidden="true"></span></a>
</p><center>
	<!-- <span style="color:#1c1c1c; background-color:#ffffff; font-size:28px; border-radius:8px">&#160 chahat[dot]singh[at]colorado[dot]edu &#160</span> -->
<!--</div>-->
</section>

<!-- copyright-section start -->
<footer class="copyright-section">
	<div class="container text-center">
		<div class="footer-menu">
			<div class="copyright-info">
				<!-- <font color="gray"><a href="/" title="Perception & Robotics Group"><img src="img/logo/praise.webp" style=" width: auto; height: 220px;"></a></font> -->
        <div class="praise-header"><a href="/" title="PRAISe at CU Boulder" style="color:black; font-size:60px">PRAISe Lab</div></a>
				<br>
				<h5>
					Perception, Robotics, AI and Sensing Lab<br>University of Colorado, Boulder<br>Copyright &#169 2024</font>
					<hr width="30%">
					<!-- Auto Year, Doesn't work in JS while loading header/footer from template -->
					<!--<script type="text/javascript">document.write( new Date().getFullYear() );</script>-->

			</div>
		</div>
	</div> 
</footer>
<!-- FOOTER -->
			

<!-- Preloader -->
 <!--<div id="preloader">
  <div id="status">
    <div class="status-mes"><center><h3>Loading...</h3><br><div class="loader"></center></div></div>
  </div>
</div>-->

`


class Footer extends HTMLElement {
	constructor() {
	  super();
	}
  
	connectedCallback() {
	  const shadowRoot = this.attachShadow({ mode: 'closed' });
  
	  shadowRoot.appendChild(footerTemplate.content);
	}
  }
  
  customElements.define('footer-component', Footer);

// Link:
// https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/