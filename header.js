const headerTemplate = document.createElement('template');

headerTemplate.innerHTML = `

    <link href="../css/team.css" rel="stylesheet"> 
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
    <script src="https://kit.fontawesome.com/4ad8d74216.js" crossorigin="anonymous"></script>

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
    <link href="../css/menu.css" rel="stylesheet">
    <!-- Template Common Styles -->
    <link href="../css/template.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="../css/style.css" rel="stylesheet">
    <!-- Responsive CSS -->
    <link href="../css/responsive.css" rel="stylesheet">
    <!-- Research CSS -->
    <link href="css/research.css" rel="stylesheet">
    <!-- ai-font for Research Fonts like Google Scholar -->
    <link rel="stylesheet" href="https://cdn.rawgit.com/jpswalsh/academicons/master/css/academicons.min.css">
    <!-- New PRAISe style CSS -->
    <link href="css/praise-style.css" rel="stylesheet">
    <!-- CSS for Cards -->
    <link href="css/cards.css" rel="stylesheet">

  <header class="praise-header">
    <nav class="navbar navbar-default" role="navigation">
      <div class="collapse navbar-collapse navbar-collapse ">
              <ul class="nav navbar-nav navbar-left">
                  <div class="PRG-header">
              <h3>
                  <div class="flex-container">
                
                
                <div><a href="https://colorado.edu/" title="University of Colorado - Boulder" target="_blank"><img class="uni-logo"
                  src="../img/logo/boulder.webp"></a>&#160 &#160</div>
                <div class="praise-header"><a href="/" title="PRAISe at CU Boulder">PRAISe Lab  &#160</div> <!-- <span class="fa fa-home">&#160</span> --> <!-- home logo -->
                <div><a href="/" title="PRAISe at CU Boulder"><img class="uni-logo"
                      src=""> &#160 </a></div>
                
  
                <!-- &#160 &#160 -->
                <!-- <div><a href="mailto:info@colorado.edu" title="Email"><p style="font-size:28px; color:#fff" class="fa fa-envelope" aria-hidden="false"> &#160 &#160</p></a></div> -->
                <!-- <div><a href="http://github.com/praisecu" title="GitHub"><p style="font-size:28px; color:#222" class="fa fa-github" aria-hidden="false"> &#160 &#160</p></a></div> -->
                <!-- <div><a href="https://www.youtube.com/" title="YouTube"><p style="font-size:28px; color:#222" class="fa fa-youtube" aria-hidden="false"></p></a></div> -->
             </h3>
          </div>
        </ul>
  
        <ul class="nav navbar-nav navbar-right">
  
          <!-- <li> <a href="news">News</a></li> -->
          <li class="dropdown">
            <a href="publications" title="Reasearch at PRAISe, CU Boulder">Research <i class="fa fa-caret-down"></i></a>
            <div class="submenu-wrapper">
              <div class="submenu-inner">
                <ul class="dropdown-menu">
                  <li><a href="research-areas">Research Areas</a></li>
                  <!-- <li><a href="software" style="font-size:19px">Tutorials/Softwares/Datasets</a></li> -->
                  <li><a href="publications">Recent Publications</a></li>
                  <!-- <li><a href="research-facilities" style="font-size:20px;">Research Facilities</a></li> -->
                </ul>
              </div>
            </div>
          </li>
          <li> <a href="teaching" title="Look at our Graduate and Undergradutate Courses we offer">Teaching</a></li>
          <li> <a href="team" title="People at PRAISe">Team</a></li>
          <li><a href="media" title="Media Coverage">Media</span></a></li>
          <li><a href="openings" title="Join Us: Openings for PhDs, Masters and Undergraduates">Openings</a></li>
          <!-- <li><a href="seminar"><b>CU Boulder</b> Seminar</a></li> -->
  
      </div>
  </div>
  </nav>
  </header>

      ;`

      class Header extends HTMLElement {
        constructor() {
          super();
        }
      
        connectedCallback() {
          const shadowRoot = this.attachShadow({ mode: 'closed' });
      
          shadowRoot.appendChild(headerTemplate.content);
        }
      }
      
      customElements.define('header-component', Header);
      
// Link:
// https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/
